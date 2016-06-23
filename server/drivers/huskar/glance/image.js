'use strict';

var Base = require('../base.js');
var driver = new Base();
var request = require('superagent');

driver.listImages = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/images',
    token,
    callback,
    query
  );
};
driver.showImageDetails = function (imageId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/images/' + imageId,
    token,
    callback,
    query
  );
};
driver.updateImage = function (imageId, payload, token, remote, callback) {
  return request
    .patch(remote + '/v2/images/' + imageId)
    .set('X-Auth-Token', token)
    .set('Content-Type', 'application/openstack-images-v2.1-json-patch')
    .send(JSON.stringify(payload))
    .end(callback);
};

module.exports = driver;
