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

  var apiPath = path.join(__dirname, '../../', config('backend').dirname, 'api');
  fs.readdirSync(apiPath)
    .forEach(function (m) {
      var apiModule = require(path.join(apiPath, m));
      var extension = extenstionList.indexOf('auth') > -1 ? extensions[m] : undefined;
      apiModule(app, extension);
    });

  return app;
};
