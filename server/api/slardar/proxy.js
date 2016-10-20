'use strict';

const getQueryString = require('helpers/getQueryString.js');

const request = require('superagent');
const noBodyMethodList = ['get', 'head', 'delete'];
const csv = require('./csv');

module.exports = (app) => {

  app.get('/proxy/csv/*', (req, res, next)=>{
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
    let region = req.headers.region;
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
