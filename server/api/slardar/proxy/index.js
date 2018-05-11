'use strict';

const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');
const noBodyMethodList = ['get', 'head', 'delete'];
const csv = require('./csv');

module.exports = (app) => {
  require('./zaqar_confirm')(app);

  // check session
  app.use(['/api/v1/', '/proxy/', '/proxy-*'], (req, res, next) => {
    if (req.session && req.session.user) {
      next();
    } else {
      res.status(401).json({error: req.i18n.__('api.keystone.unauthorized')});
    }
  });

  app.get('/proxy/csv-field/*', csv.fields);
  app.get('/proxy/csv/*', csv.data);

  app.get('/proxy-search/*', require('./search'));

  require('./swift')(app);
  app.use(['/proxy-swift/', '/proxy-glance/', '/proxy-shadowfiend/'], require('./common'));
  require('./proxy_need_admin')(app);

  app.all('/proxy/*', (req, res, next) => {
    let remote = req.session.endpoint;
    let region = req.headers.region || req.session.user.regionId;
    let service = req.path.split('/')[2];
    let target = remote[service][region] + '/' + req.path.split('/').slice(3).join('/');
    let method = req.method.toLowerCase();

    if (noBodyMethodList.indexOf(method) !== -1) {
      request[method](target + getQueryString(req.query))
        .set(req.headers)
        .set('X-Auth-Token', req.tempAdminToken || req.session.user.token)
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
        .set('X-Auth-Token', req.tempAdminToken || req.session.user.token)
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
