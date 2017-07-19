'use strict';

const request = require('superagent');
const http = require('http');
const co = require('co');
const uuid = require('uuid');
const _ = require('lodash');

const getQueryString = require('helpers/getQueryString.js');
const noBodyMethodList = ['get', 'head', 'delete'];
const csv = require('./csv');
const customResPage = require('../brewmaster/api/base').middleware.customResPage;
const adminLogin = require('./common/adminLogin');
const config = require('config');
const configRegion = config('region');
const adminProjectId = config('admin_projectId');
const regionId = (configRegion && configRegion[0] && configRegion[0].id) || 'RegionOne';


module.exports = (app) => {
  app.get('/proxy-zaqar/confirm-subscriptions/email', function (req, res, next) {
    co(function *() {
      const adminToken = yield adminLogin();
      const remote = adminToken.remote.zaqar[regionId];
      const target = remote + req.query.Paths;

      request.put(target)
        .set('X-Auth-Token', adminToken.token)
        .set('Client-ID', uuid.v1())
        .send({confirmed: true})
        .end((err) => {
          if (err) {
            next({status: 500, message: req.i18n.__('api.keystone.confirmError')});
          } else {
            next({message: req.i18n.__('api.keystone.confirmSuccess')});
          }
        });

    }).catch(err => {
      next(err);
    });
  }, customResPage);

  app.get([
    '/proxy/kiki/v1/subscriptions/:id/confirm',
    '/proxy/kiki/v1/subscriptions/confirm'
  ], function (req, res, next) {
    co(function *() {
      const adminToken = yield adminLogin();
      const target = adminToken.remote.kiki[regionId] + '/' + req.path.split('/').slice(3).join('/');

      request.post(target)
        .set('X-Auth-Token', adminToken.token)
        .send(Object.assign({}, req.query))
        .end((err, payload) => {
          if (err) {
            next({status: 500, message: req.i18n.__('api.keystone.confirmError')});
          } else {
            next({message: req.i18n.__('api.keystone.confirmSuccess')});
          }
        });

    }).catch(err => {
      next({message: req.i18n.__('api.keystone.confirmError')});
    });
  }, customResPage);
  // check session
  app.use(['/api/v1/', '/proxy/', '/proxy-search/', '/proxy-zaqar/', '/proxy-swift/'], function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.keystone.unauthorized')});
    }
  });
  app.put('/proxy-swift/init-container', (req, res, next) => {
    co(function *() {
      const adminToken = yield adminLogin();
      let endpoint = req.session.endpoint;
      let region = req.session.user.regionId;
      if (!endpoint.swift) {
        res.status(503).json({
          status: 503,
          message: req.i18n.__('api.swift.unavailable')
        });
      }
      const containers = ['template', 'ticket'];
      let swiftHost = endpoint.swift[region];
      let projectId = req.session.user.projectId;
      let swiftAccount = 'AUTH_' + adminProjectId;
      yield Promise.all(containers.map(container => {
        return request.put(`${swiftHost}/v1/${swiftAccount}/${projectId}_${container}`)
          .set('X-Auth-Token', adminToken.token)
          .set('X-Container-write', `${projectId}:*`)
          .set('X-Container-read', '.r:*,.rlistings');
      }));
      res.end();
    }).catch(next);
  });
  app.use('/proxy-swift/', (req, res, next) => {
    let endpoint = req.session.endpoint;
    let region = req.session.user.regionId;
    if (!endpoint.swift) {
      res.status(503).json({
        status: 503,
        message: req.i18n.__('api.swift.unavailable')
      });
    }
    let swiftHost = endpoint.swift[region];
    const headers = _.omit(req.headers, ['cookie']);
    headers['X-Auth-Token'] = req.session.user.token;
    const url = '/' + req.path.split('/').slice(1).join('/') + getQueryString(req.query);
    const options = {
      hostname: swiftHost.split('://')[1].split(':')[0],
      port: swiftHost.split('://')[1].split(':')[1],
      path: url,
      method: req.method,
      headers: headers
    };
    const swiftReq = http.request(options, (response) => {
      res.set(response.headers);
      res.status(response.statusCode);
      response.pipe(res);
      response.on('end', () => {
        res.end();
      });
    });
    req.pipe(swiftReq);
    swiftReq.on('error', (e) => {
      res.status(500).send(e);
    });
  });

  app.patch('/proxy-zaqar/v2/queues/:queue_name', function (req, res, next) {
    let queueName = req.params.queue_name;
    let endpoint = req.session.endpoint;
    let region = req.session.user.regionId;
    let host = endpoint.zaqar[region];

    const postData = JSON.stringify(req.body);
    const options = {
      hostname: host.split('://')[1].split(':')[0],
      port: host.split('://')[1].split(':')[1],
      path: '/v2/queues/' + queueName,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/openstack-messaging-v2.0-json-patch',
        'Content-Length': Buffer.byteLength(postData),
        'X-Auth-Token': req.session.user.token,
        'Client-ID': uuid.v1()
      }
    };

    const patchReq = http.request(options, (response, www) => {
      response.setEncoding('utf8');
      let body;
      response.on('data', (chunk) => {
        body = chunk;
      });
      response.on('end', () => {
        res.set(response.headers);
        res.status(response.statusCode).json(JSON.parse(body));
      });
    });

    patchReq.on('error', (e) => {
      res.status(500).send(e);
    });

    patchReq.write(postData);
    patchReq.end();

  });
  /**
   * /proxy/csv-field/os-hypervisors
   * /proxy/csv-field/floatingips
   * /proxy/csv-field/images
   * /proxy/csv-field/servers
   * /proxy/csv-field/volumes
   * /proxy/csv-field/snapshots
   */
  app.get('/proxy/csv-field/*', csv.fields);
  /**
   * /proxy/csv/cinder/v2/{}/snapshots/detail
   * /proxy/csv/cinder/v2/{}/volumes/detail
   * /proxy/csv/nova/v2.1/{}/servers/detail
   * /proxy/csv/nova/v2.1/{}/os-hypervisors/detail
   * /proxy/csv/neutron/v2.0/floatingips
   * /proxy/csv/glance/v2/images
   */
  app.get('/proxy/csv/*', csv.data);
  app.get('/proxy-search/*', require('./proxy.search'));
  app.all('/proxy/*', (req, res, next) => {
    // if (req.body) {
    //   if (req.body.forceDelete !== undefined) {
    //     return res.status(403).json({Error: 'Request is not allowwed!'});
    //   }
    // }
    let remote = req.session.endpoint;
    let region = req.headers.region || req.session.user.regionId;
    let service = req.path.split('/')[2];
    let target = remote[service][region] + '/' + req.path.split('/').slice(3).join('/');
    let method = req.method.toLowerCase();

    if (noBodyMethodList.indexOf(method) !== -1) {
      request[method](target + getQueryString(req.query))
        .set(req.headers)
        .set('X-Auth-Token', req.session.user.token)
        .end((err, payload) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json(payload.body);
          }
        });
    } else {
      request[method](target + getQueryString(req.query))
        .set(req.headers)
        .set('X-Auth-Token', req.session.user.token)
        .send(req.body)
        .end((err, payload) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json(payload.body);
          }
        });
    }
  });
};
