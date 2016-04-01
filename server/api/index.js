'use strict';

/**
 * Internal dependencies
 */
const version = require('package.json').version;
const extensions = require('./extensions');
const extenstionList = Object.keys(extensions);
const config = require('config');
const path = require('path');

const fs = require('fs');

module.exports = function(app) {
  app.get('/version', function(request, response) {
    response.json({
      version: version
    });
  });

  let apiModulePath = path.join(__dirname, '../../', config('backend').dirname, 'api');
  fs.readdirSync(apiModulePath)
    .filter(function (m) {
      return m !== 'base.js';
    })
    .forEach(function (m) {
      if (m !== '.DS_Store') {
        let apiComponent = require(path.join(apiModulePath, m));
        Object.keys(apiComponent).forEach(function(k){
          let apiModule = apiComponent[k];
          let extension = extenstionList.indexOf(m) > -1 ? extensions[m] : undefined;
          apiModule(app, extension);
        });
      }
    });

  return app;
};
