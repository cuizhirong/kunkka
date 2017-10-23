'use strict';
const _ = require('lodash');
const co = require('co');
const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');
const listImageRecursive = require('../listImageRecursive');
const handleNetwork = require('./handleNetwork');
const objects = require('./objectList');

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

const detailRegExp = /s\/detail$/;
/**
 *
 * @param req
 * @param res
 * @param next
 * @return object {list:[], links:{next}}
 */
module.exports = (req, res, next) => {
  co(function *() {
    const token = req.session.user.token;
    const endpoint = req.session.endpoint;
    const region = req.session.user.regionId;
    const path = req.path.slice(prefix.length);
    const pathSplit = req.path.split('/');
    const service = pathSplit[2];
    const target = endpoint[service][region] + '/' + pathSplit.slice(3).join('/');
    const searchId = req.query.id ? req.query.id.trim() : '';
    const search = req.query.search ? req.query.search.trim() : '';
    const page = toNaturalNumber(req.query.page) || 1;
    const limit = toNaturalNumber(req.query.limit);
    delete req.query.search;

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
        rs = obj.singleKey === false ? rs.body : rs.body[obj.name];
        result = {list: [rs], links: {next: null}};
      } catch (e) {
        if (e.status === 404) {
          result = {list: [], links: {next: null}};
        } else {
          throw e;
        }
      }
    } else if (!search && !(pathSplit[4] === 'images' && req.query.image_type)) {
      data = yield request.get(target + getQueryString(req.query)).set('X-Auth-Token', token);
      data = data.body;
      delete req.query.page;
      delete req.query.id;
      if (!obj.hasPagination && limit) {
        result = paginate(page, limit, data[obj.name + 's'], path, req.query);
      } else {
        result = {list: data[obj.name + 's'], links: {prev: null, next: null}};
        if (obj.linkKey === null) {
          Object.keys(data).forEach(key => {
            if (key !== obj.name + 's' && data[key]) {
              result.links[key] = `${prefix}/${obj.service}/${obj.version}${data[key].split('/' + obj.version)[1]}`;
            }
          });
        } else if (data[obj.name + 's_links']) {
          data[obj.name + 's_links'].forEach(l => {
            result.links[l.rel] = `${prefix}/${obj.service}/${obj.version}${l.href.split('/' + obj.version)[1]}`;
          });
        }
      }
    } else {
      delete req.query.page;
      delete req.query.limit;
      delete req.query.marker;
      delete req.query.id;

      const re = new RegExp(search, 'i');
      let list;
      if (pathSplit[4] === 'images') {
        let images = [];
        let queryToOpenstack = _.omit(req.query, ['image_type']);
        queryToOpenstack.limit = 9999;
        yield listImageRecursive(queryToOpenstack, '', token, endpoint[service][region], images);

        let imageType = req.query.image_type;
        let isFilterSnapshot = (imageType === 'snapshot');
        if (imageType && search) {
          if(isFilterSnapshot){
            list = images.filter(image => {
              return re.test(image[obj.match || 'name']) && image.image_type === 'snapshot';
            });
          } else {
            list = images.filter(image => {
              return image.image_type !== 'snapshot' && re.test(image[obj.match || 'name']);
            });
          }
        } else if(!search) {
          if(isFilterSnapshot){
            list = images.filter(image => {
              return image.image_type === 'snapshot';
            });
          } else {
            list = images.filter(image => {
              return image.image_type !== 'snapshot';
            });
          }
        } else {
          list = images.filter(image => {
            return re.test(image[obj.match || 'name']);
          });
        }
      } else {
        data = yield request.get(target + getQueryString(req.query)).set('X-Auth-Token', token);
        list = data.body[obj.name + 's'].filter(d => re.test(d[obj.match || 'name']));
      }
      if (limit) {
        result = paginate(page, limit, list, path, Object.assign({search}, req.query));
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
