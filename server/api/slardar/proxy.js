'use strict';

const request = require('superagent');
const co = require('co');

const getQueryString = require('helpers/getQueryString.js');
const noBodyMethodList = ['get', 'head', 'delete'];
const csv = require('./csv');
const render = require('../brewmaster/api/base').func.render;
const adminLogin = require('./common/adminLogin');
const configRegion = require('config')('region');
const regionId = (configRegion && configRegion[0] && configRegion[0].id) || 'RegionOne';

module.exports = (app) => {

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
            render({
              req, res, err: {
                status: 500,
                customRes: true,
                message: req.i18n.__('api.keystone.confirmError')
              }
            });
          } else {
            render({
              req, res, content: {message: req.i18n.__('api.keystone.confirmSuccess')}
            });
          }
        });

    }).catch(err => {
      render({req, res, err});
    });
  });
  // check session
  app.use(['/api/v1/', '/proxy/'], function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.keystone.unauthorized')});
    }
  });

  app.get('/proxy/csv/*', (req, res, next) => {
    let remote = req.session.endpoint;
    let region = req.session.user.regionId;
    let service = req.path.split('/')[3];
    let target = remote[service][region] + '/' + req.path.split('/').slice(4).join('/');
    request.get(target + getQueryString(req.query))
      .set('X-Auth-Token', req.session.user.token)
      .end((err, payload) => {
        if (err) {
          next(err);
        } else {
          res.payload = payload.body;
          next();
        }
      });
  }, csv);
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
