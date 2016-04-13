'use strict';

require('babel-core/register')({
  ignore: ['node_modules', 'server', 'configs', 'views']
});
require('../helpers/less_register');

const path = require('path');
const fs = require('fs');
const frontendApps = fs.readdirSync('client/applications').filter(file => {
  return file !== '.DS_Store';
});
const backendApps = fs.readdirSync('server/api').filter(file => {
  return fs.statSync('server/api/' + file).isDirectory();
});
const viewsPath = {};

backendApps.forEach((a) => {
  let viewPath = path.join('server/api', a, 'views');
  fs.readdirSync(viewPath)
    .filter(file => {
      return fs.statSync(path.join(viewPath, file)).isDirectory();
    })
    .forEach(p => {
      viewsPath[p] = path.join(viewPath, p);
    });
});

module.exports = (app) => {
  app.set('views', []);
  app.set('applications', frontendApps);
  frontendApps.forEach(a => {
    require(viewsPath[a])(app);
  });
};
