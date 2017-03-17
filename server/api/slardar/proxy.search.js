'use strict';
const co = require('co');
const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');

const prefix = '/proxy-search';
const objects = [
  {
    name: 'hypervisors', re: /\/nova\/v2.1\/[a-z0-9]*\/os-hypervisors\/detail/i,
    hasPagination: true, service: 'nova', version: 'v2.1',
    match: 'hypervisor_hostname'
  },
  {
    name: 'servers', re: /\/nova\/v2.1\/[a-z0-9]*\/servers\/detail/i,
    hasPagination: true, service: 'nova', version: 'v2.1'
  },
  {
    name: 'flavors', re: /\/nova\/v2.1\/[a-z0-9]*\/flavors\/detail/i,
    hasPagination: true, service: 'nova', version: 'v2.1'
  },
  {
    name: 'images', re: /\/glance\/v2\/images/i,
    hasPagination: true, linkKey: null, service: 'glance', version: 'v2'
  },
  {
    name: 'volumes', re: /\/cinder\/v2\/[a-z0-9]*\/volumes\/detail/i,
    hasPagination: true, service: 'cinder', version: 'v2'
  },
  {
    name: 'snapshots', re: /\/cinder\/v2\/[a-z0-9]*\/snapshots\/detail/i,
    hasPagination: true, service: 'cinder', version: 'v2'
  },
  {
    name: 'floatingips', re: /\/neutron\/v2.0\/floatingips/i,
    hasPagination: true, service: 'neutron', version: 'v2.0',
    match: 'floating_ip_address'
  },
  {
    name: 'ports', re: /\/neutron\/v2.0\/ports/i,
    hasPagination: true, service: 'neutron', version: 'v2.0'
  },
  {
    name: 'domains', re: /\/keystone\/v3\/domains/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'projects', re: /\/keystone\/v3\/projects/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'users', re: /\/keystone\/v3\/users/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'groups', re: /\/keystone\/v3\/groups/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  },
  {
    name: 'roles', re: /\/keystone\/v3\/roles/i,
    hasPagination: false, service: 'keystone', version: 'v3'
  }
];

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
    const remote = req.session.endpoint;
    const region = req.session.user.regionId;
    const path = req.path.slice(prefix.length);
    const service = req.path.split('/')[2];
    const target = remote[service][region] + '/' + req.path.split('/').slice(3).join('/');
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
    if (!search) {
      data = yield request.get(target + getQueryString(req.query)).set('X-Auth-Token', token);
      data = data.body;
      delete req.query.page;
      if (!obj.hasPagination && limit) {
        result = paginate(page, limit, data[obj.name], path, req.query);
      } else {
        result = {list: data[obj.name], links: {prev: null, next: null}};
        if (obj.linkKey === null) {
          Object.keys(data).forEach(key => {
            if (key !== obj.name && data[key]) {
              result.links[key] = `${prefix}/${obj.service}/${obj.version}${data[key].split('/' + obj.version)[1]}`;
            }
          });
        } else if (data[obj.name + '_links']) {
          data[obj.name + '_links'].forEach(l => {
            result.links[l.rel] = `${prefix}/${obj.service}/${obj.version}${l.href.split('/' + obj.version)[1]}`;
          });
        }
      }
      res.send(result);
    } else {
      delete req.query.page;
      delete req.query.limit;
      delete req.query.marker;
      data = yield request.get(target + getQueryString(req.query)).set('X-Auth-Token', token);
      const re = new RegExp(search, 'i'),
        list = data.body[obj.name].filter(d => re.test(d[obj.match || 'name']));
      if (limit) {
        result = paginate(page, limit, list, path, Object.assign({search}, req.query));
      } else {
        result = {list, links: {next: null, prev: null}};
      }
      res.send(result);
    }
  }).catch(next);
};
