/**
 * Internal dependencies
 */
var version = require('package.json').version;
var extensions = require('./extensions');
var extenstionList = Object.keys(extensions);

module.exports = function(app) {
  app.get('/version', function(request, response) {
    response.json({
      version: version
    });
  });

  var auth = require('api/auth');
  var authExtension = extenstionList.indexOf('auth') > -1 ? extensions.auth : undefined;
  auth(app, authExtension);

  var instance = require('api/instance');
  var instanceExtension = extenstionList.indexOf('instance') > -1 ? extensions.instance : undefined;
  instance(app, instanceExtension);

  var volume = require('api/volume');
  var volumeExtension = extenstionList.indexOf('volume') > -1 ? extensions.volume : undefined;
  volume(app, volumeExtension);

  var network = require('api/network');
  var networkExtension = extenstionList.indexOf('network') > -1 ? extensions.network : undefined;
  network(app, networkExtension);

  var image = require('api/image');
  var imageExtension = extenstionList.indexOf('image') > -1 ? extensions.image : undefined;
  image(app, imageExtension);

  return app;
};
