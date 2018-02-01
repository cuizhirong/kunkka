'use strict';

const fs = require('fs');
const path = require('path');
const co = require('co');
const drivers = require('drivers');
const config = require('config');

module.exports = function (app) {
  app.get('/api/email/corporation-info', function (req, res, next) {
    co(function* () {
      let info = yield drivers.email.getCorporationInfo();
      let smtp = config('smtp');
      let from = smtp && smtp.auth && smtp.auth.user;
      info.from = from || '';
      res.send(info);
    }).catch(next);
  });
  app.get('/auth/*', function (req, res, next) {
    if (req.path === '/auth/logout') {
      next();
    } else if (req.path === '/auth/admin-reauth') {
      if (!req.session.user) {
        res.redirect('/auth/login?cb=' + (req.query.cb || '/admin'));
      } else {
        next();
      }
    } else if (req.session && req.session.user) {
      res.redirect(req.query.cb || '/');
    } else {
      next();
    }
  });

  let apiPath = path.join(__dirname, 'api');
  fs.readdirSync(apiPath)
    .filter(file => file.indexOf('.') !== 0 && file !== 'base')
    .forEach(file => {
      let ApiModule = require(path.join(apiPath, file));
      let apiModule = new ApiModule(app);
      if (apiModule.initRoutes) {
        apiModule.initRoutes();
      }
    });
};
