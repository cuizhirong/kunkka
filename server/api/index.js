/**
 * Internal dependencies
 */
var version = require('package.json').version;
var extensions = require('./extensions');
var extenstionList = Object.keys(extensions);
var config = require('config');
var path = require('path');

var fs = require('fs');

module.exports = function(app) {
  app.get('/version', function(request, response) {
    response.json({
      version: version
    });
  });

  var apiModulePath = path.join(__dirname, '../../', config('backend').dirname, 'api');
  fs.readdirSync(apiModulePath)
    .filter(function (m) {
      return m !== 'base.js';
    })
    .forEach(function (m) {
      if (m !== '.DS_Store') {
        var apiComponent = require(path.join(apiModulePath, m));
        Object.keys(apiComponent).forEach(function(k){
          var apiModule = apiComponent[k];
          var extension = extenstionList.indexOf(m) > -1 ? extensions[m] : undefined;
          apiModule(app, extension);
        });
      }
    });

  return app;
};
