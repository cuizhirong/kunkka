'use strict';
const _ = require('lodash');
const co = require('co');
const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');
const listImageRecursive = require('../listImageRecursive');
const handleNetwork = require('./handleNetwork');
const objects = require('./objectList');

const otherServiceUser = ['heat_stack_domain_admin', 'billing_admin'];

const prefix = '/proxy-search';

let objServer;
objects.some(o => ((o.name === 'server') && (objServer = o)));

/**
 * toNaturalNumber
 * @param str
 * @return 0,1,2,3,...
 */
const toNaturalNumber = (str) => {
  const num = parseInt(str, 10);
  return (isNaN(num) || num < 0) ? 0 : num;
};

/**
 * paginate
 * @param page number
 * @param limit number
 * @param list array
 * @param path string
 * @param query object
 * @return object {list:[],links:{next,prev}}
 */
const paginate = (page, limit, list, path, query) => {
  const totalPage = Math.ceil(list.length / limit);
  const start = limit * (page - 1);
  const end = start + limit;
  const result = {
    list: list.slice(start, end),
    links: {next: null, prev: null}
  };
  if (page < totalPage) {
    result.links.next = prefix + path + getQueryString(Object.assign({page: page + 1, limit}, query));
  }
  if (page > 1) {
    result.links.prev = prefix + path + getQueryString(Object.assign({page: page - 1, limit}, query));
  }
  return result;
};

const isCurrentUserType = (username, type, endpoint) => {
  if (type === 'service') {
    return (endpoint[username] || otherServiceUser.indexOf(username) > -1);
  } else if (type === 'person') {
    return !endpoint[username] && otherServiceUser.indexOf(username) === -1;
  } else {
    return false;
  }
};

const detailRegExp = /s\/detail$/;
/**
 *
 * @param req
 * @param res
 * @param next
 * @return object {list:[], links:{next}}
 */
module.exports = (req, res, next) => {
  co(function* () {
    const token = req.session.user.token;
    const endpoint = req.session.endpoint;
    const region = req.session.user.regionId;
    const path = req.path.slice(prefix.length);
    const pathSplit = req.path.split('/');
    const service = pathSplit[2];
    const target = endpoint[service][region] + '/' + pathSplit.slice(3).join('/');
    const searchId = req.query.id ? req.query.id.trim() : '';
    const search = req.query.search ? req.query.search.trim() : '';
    const re = new RegExp(search, 'i');

    const page = toNaturalNumber(req.query.page) || 1;
    const limit = toNaturalNumber(req.query.limit);
    const pureQuery = _.omit(req.query, ['search', 'page', 'limit', 'marker', 'id']);

    let obj,
      data,   //data that OpenStack returned
      result; //result for this request

    objects.some(o => ((o.re.test(path)) && (obj = o)));
    if (!obj) {
      return next();
    }
    if (searchId) {
      try {
        const singleUrl = detailRegExp.test(target) ? target.replace(detailRegExp, 's/' + searchId) : target + '/' + searchId;
        let rs = yield request.get(singleUrl).set('X-Auth-Token', token);
        if (obj.name === 'image') {
          rs = rs.body;
          let imageType = pureQuery.image_type;
          let visibility = pureQuery.visibility;

          if (rs && imageType && (imageType === 'snapshot' ^ rs.image_type === 'snapshot')) {
            rs = null;
          }
          if (rs && visibility && rs.visibility !== visibility) {
            rs = null;
          }
        } else if (obj.name === 'user') {
          rs = rs.body.user;
          let userType = pureQuery.user_type;
          if (rs && userType && !isCurrentUserType(rs.name, userType, endpoint)) {
            rs = null;
          }
        } else {
          rs = rs.body[obj.name];
        }

        result = {list: rs ? [rs] : [], links: {next: null}};
      } catch (e) {
        if (e.status === 404) {
          result = {list: [], links: {next: null}};
        } else {
          throw e;
        }
      }
    } else if (obj.name === 'image') {
      let images = [];
      let queryToOpenStack = _.omit(pureQuery, ['image_type']);
      queryToOpenStack.limit = 9999;
      yield listImageRecursive(queryToOpenStack, '', token, endpoint[service][region], images);

      let imageType = pureQuery.image_type;
      let isFilterSnapshot = imageType === 'snapshot';
      let list = images;
      if (search) {
        list = list.filter(image => re.test(image[obj.match || 'name']));
      }
      if (imageType) {
        list = list.filter(image => {
          return isFilterSnapshot ? image.image_type === 'snapshot' : image.image_type !== 'snapshot';
        });
      }

      if (limit) {
        result = paginate(page, limit, list, path, Object.assign({search}, pureQuery));
      } else {
        result = {list, links: {next: null, prev: null}};
      }
    } else {
      data = yield request.get(target + getQueryString(pureQuery)).set('X-Auth-Token', token);
      let list = data.body[obj.name + 's'];
      if (obj.name === 'user' && pureQuery.user_type) {
        list = list.filter(user => isCurrentUserType(user.name, pureQuery.user_type, endpoint));
      }
      if (search) {
        list = list.filter(item => re.test(item[obj.match || 'name']));
      }
      if (limit) {
        result = paginate(page, limit, list, path, Object.assign({search}, pureQuery));
      } else {
        result = {list, links: {next: null, prev: null}};
      }
    }

    if (obj.networkHandler) {
      yield handleNetwork(result.list, {objServer, obj, region, token, endpoint});
    }
    res.send(result);
  }).catch(next);
};
