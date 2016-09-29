'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (app) {
  app.get('/auth/*', function (req, res, next) {
    if (req.session && req.session.user && req.path !== '/auth/logout') {
      res.redirect('/');
    } else {
      next();
    }
  });
  let apiPath = path.join(__dirname, 'api');
  fs.readdirSync(apiPath)
    .filter(file => file.indexOf('.') !== 0 && file !== 'base.js')
    .forEach(file => {
      let ApiModule = require(path.join(apiPath, file));
      let apiModule = new ApiModule(app);
      if (apiModule.initRoutes) {
        apiModule.initRoutes();
      }
    });
};
