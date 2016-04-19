'use strict';

var express = require('express');
var router = express.Router();
var remote = require('config')('remote');
var getQueryString = require('helpers/getQueryString.js');

var request = require('superagent');
var noBodyMethodList = ['get', 'head', 'delete'];

router.all('/*', function (req, res, next) {
  if (req.body) {
    if (req.body.forceDelete !== undefined) {
      return res.status(403).json({Error: 'Request is not allowwed!'});
    }
  }
  var region = req.headers.region;
  var service = req.path.split('/')[1];
  var target = (service === 'keystone' ? remote[service] : remote[service][region]) + '/' + req.path.split('/').slice(2).join('/');
  var method = req.method.toLowerCase();
  if (noBodyMethodList.indexOf(method) !== -1) {
    request[method](target + getQueryString(req.query))
      .set(req.headers)
      .set('X-Auth-Token', req.session.user.token)
      .end(function (err, payload) {
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
      .end(function (err, payload) {
        if (err) {
          next(err);
        } else {
          res.status(200).json(payload.body);
        }
      });
  }
});

module.exports = router;
