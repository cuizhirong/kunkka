'use strict';

const remote = require('config')('remote');
const getQueryString = require('helpers/getQueryString.js');

const request = require('superagent');
const noBodyMethodList = ['get', 'head', 'delete'];

module.exports = (app) => {
  app.all('/proxy/*', (req, res, next) => {
    if (req.body) {
      if (req.body.forceDelete !== undefined) {
        return res.status(403).json({Error: 'Request is not allowwed!'});
      }
    }
    let region = req.headers.region;
    let service = req.path.split('/')[2];
    let target = (service === 'keystone' ? remote[service] : remote[service][region]) + '/' + req.path.split('/').slice(3).join('/');
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
