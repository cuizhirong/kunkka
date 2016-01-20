/**
 * Internal dependencies
 */
var version = require('package.json').version;
var extensions = require('./extensions');
var extenstionList = Object.keys(extensions);

var fs = require('fs');

module.exports = function(app) {
  app.get('/version', function(request, response) {
    response.json({
      version: version
    });
  });

  fs.readdirSync(__dirname)
    .filter(function (dir) {
      return dir !== 'index.js' && dir !== 'extensions';
    })
    .forEach(function (m) {
      var apiModule = require('./' + m);
      var extension = extenstionList.indexOf('auth') > -1 ? extensions[m] : undefined;
      apiModule(app, extension);
    });

  return app;
};
