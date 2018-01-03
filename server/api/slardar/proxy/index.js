'use strict';

const request = require('superagent');
const http = require('http');
const _ = require('lodash');

const getQueryString = require('helpers/getQueryString.js');
const noBodyMethodList = ['get', 'head', 'delete'];
const csv = require('./csv');

module.exports = (app) => {
  require('./zaqar_confirm')(app);

  // check session
  app.use(['/api/v1/', '/proxy/', '/proxy-search/', '/proxy-zaqar/', '/proxy-swift/', '/proxy-glance/'], function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.keystone.unauthorized')});
    }
  });

  require('./swift')(app);

  app.use(['/proxy-glance/'], (req, res, next) => {
    let service = req.originalUrl.split('/')[1].slice(6);
    let endpoint = req.session.endpoint;
    let region = req.session.user.regionId;
    if (!endpoint[service]) {
      res.status(503).json({
        status: 503,
        message: service + req.i18n.__('api.swift.unavailable')
      });
    }
    const swiftHost = endpoint[service][region];
    const hostnameAndPort = swiftHost.split('://')[1].split('/')[0];
    const headers = _.omit(req.headers, ['cookie']);
    headers['X-Auth-Token'] = req.session.user.token;
    const url = '/' + req.path.split('/').slice(1).join('/') + getQueryString(req.query);
    const options = {
      hostname: hostnameAndPort.split(':')[0],
      port: hostnameAndPort.split(':')[1],
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
  app.get('/proxy-search/*', require('./search'));
  app.all('/proxy/*', (req, res, next) => {
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
      let reqBody = req.body;
      if (req.headers['content-type'] === 'application/openstack-messaging-v2.0-json-patch' && Array.isArray(reqBody)) {
        reqBody = JSON.stringify(reqBody);
      }
      request[method](target + getQueryString(req.query))
        .set(req.headers)
        .set('X-Auth-Token', req.session.user.token)
        .send(reqBody)
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
