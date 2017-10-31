'use strict';

require('babel-core/register')({
  ignore: ['node_modules', 'server', 'configs', 'views']
});
require('../helpers/less_register');

const path = require('path');
const fs = require('fs');
const frontendApps = fs.readdirSync('client/applications').filter(file => file.indexOf('.') === -1);
const backendApps = fs.readdirSync('server/api').filter(file => {
  return fs.statSync('server/api/' + file).isDirectory();
});
const viewsPath = {};

backendApps.forEach((a) => {
  let viewPath = path.join('server/api', a, 'views');
  try {
    fs.readdirSync(viewPath)
      .filter(file => fs.statSync(path.join(viewPath, file)).isDirectory())
      .forEach(p => viewsPath[p] = path.join(viewPath, p));
  } catch (e) {
    console.log(`${a} has no views`);
  }
});

// mock browser global variables: window and document
global.window = {};
global.document = {};
global.HALO = {configs: {
  renderer: 'server',
  init: true
}};

module.exports = (app) => {
  app.set('views', [__dirname]);
  app.set('applications', frontendApps);
  let clientApps = frontendApps.filter(a => a !== 'login' && a !== 'register');
  let clientAppModules = [];
  frontendApps.forEach(a => {
    if (viewsPath[a]) {
      clientAppModules.push({
        model: require(viewsPath[a]),
        name: a
      });
    }
  });
  clientAppModules.forEach(m => {
    m.model.main(app, clientApps, m.name, clientAppModules);
  });
};
