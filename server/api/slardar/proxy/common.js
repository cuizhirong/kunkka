'use strict';

const requests = {
  'http:': require('http'),
  'https:': require('https')
};
const Url = require('url');
const _ = require('lodash');

module.exports = (req, res, next) => {
  const region = req.session.user.regionId;
  const service = req.originalUrl.split('/')[1].slice(6);
  if (!req.session.endpoint || !req.session.endpoint[service]) {
    res.status(503).json({
      status: 503,
      message: req.i18n.__('api.swift.unavailable')
    });
  }
  const host = req.session.endpoint[service][region];
  const url = host + req.url;
  const headers = _.omit(req.headers, ['cookie']);
  headers['X-Auth-Token'] = req.session.user.token;

  const options = Url.parse(url);
  options.rejectUnauthorized = false;
  options.method = req.method;
  options.headers = headers;

  if (!requests[options.protocol]) {
    return res.status(500).end();
  }
  const request = requests[options.protocol].request;

  const commonReq = request(options, (response) => {
    res.set(response.headers);
    res.status(response.statusCode);
    response.pipe(res);
    response.on('end', () => {
      res.end();
    });
  });
  req.pipe(commonReq);
  commonReq.on('error', (e) => {
    res.status(500).send(e);
  });
};
