'use strict';

require('babel-core/register')({
  ignore: ['node_modules', 'server', 'configs', 'views']
});
require('../helpers/less_register');

const path = require('path');
const fs = require('fs');
const frontendApps = fs.readdirSync('client/applications');
const backendApps = fs.readdirSync('server/api').filter((f) => {
  return fs.statSync('server/api/' + f).isDirectory();
});
const viewsPath = {};

backendApps.forEach((a) => {
  let viewPath = path.join('server/api', a, 'views');
  fs.readdirSync(viewPath).forEach((p) => {
    viewsPath[p] = path.join(viewPath, p);
  });
});

module.exports = (app) => {
  app.set('views', []);
  app.set('applications', frontendApps);
  frontendApps.forEach((a) => {
    require(viewsPath[a])(app);
  });
};
