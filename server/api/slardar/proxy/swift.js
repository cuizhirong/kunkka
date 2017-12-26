'use strict';

const superagent = require('superagent');
const request = {
  'http:': require('http'),
  'https:': require('https')
};
const Url = require('url');
const co = require('co');
const _ = require('lodash');

const adminLogin = require('../common/adminLogin');

module.exports = (app) => {
  app.use('/proxy-swift', (req, res, next) => {
    if (!req.session.endpoint.swift) {
      res.status(503).json({
        status: 503,
        message: req.i18n.__('api.swift.unavailable')
      });
    } else {
      let region = req.session.user.regionId;
      req.swiftHost = req.session.endpoint.swift[region];
      next();
    }
  });
  app.put('/proxy-swift/init-container', (req, res, next) => {
    co(function* () {
      const containers = ['template', 'ticket'];
      let token = req.session.user.token;
      let swiftHost = req.swiftHost;
      if (swiftHost.indexOf('AUTH_') > -1) {
        let adminToken = yield adminLogin();
        token = adminToken.token;
      }
      let projectId = req.session.user.projectId;
      yield Promise.all(containers.map(container => {
        return superagent.put(`${swiftHost}/${projectId}_${container}`)
          .set('X-Auth-Token', token)
          .set('X-Container-write', `${projectId}:*`)
          .set('X-Container-read', '.r:*,.rlistings');
      }));
      res.status(204).end();
    }).catch(next);
  });

  //check exist before create an object.
  app.put('/proxy-swift/:container/*', (req, res, next) => {
    if (req.query.replace) {
      return next();
    }

    const swiftHost = req.swiftHost;
    const headers = _.omit(req.headers, ['cookie']);
    headers['X-Auth-Token'] = req.session.user.token;

    const url = swiftHost + req.url.slice(12);
    const options = Url.parse(url);
    Object.assign(options, {method: 'get', headers, rejectUnauthorized: false});

    request[options.protocol].request(options, resGet => {
      if (resGet.statusCode === 200) {
        res.status(400).send({
          status: 400,
          message: req.i18n.__('api.swift.nameToken')
        });
      } else {
        options.method = 'put';
        const swiftReq = request[options.protocol].request(options, resPut => {
          res.set(resPut.headers);
          res.status(resPut.statusCode);
          resPut.pipe(res);
          resPut.on('end', () => {
            res.end();
          });
        }).on('error', errPut => {
          res.status(500).send(errPut);
        });
        req.pipe(swiftReq);
      }
    }).on('error', errGet => {
      res.status(500).send(errGet);
    }).end();
  });

  app.use('/proxy-swift/', (req, res, next) => {
    const swiftHost = req.swiftHost;

    let url = swiftHost + req.url;
    let headers = _.omit(req.headers, ['cookie']);
    headers['X-Auth-Token'] = req.session.user.token;

    let options = Url.parse(url);
    options.rejectUnauthorized = false;
    options.method = req.method;
    options.headers = headers;

    if (!request[options.protocol]) {
      return res.status(500).end();
    }

    const swiftReq = request[options.protocol].request(options, (response) => {
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
};
