'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listVolumes = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/' + projectId + '/volumes/detail',
    token,
    callback,
    query
  );
};
driver.listVolumeTypes = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/' + projectId + '/types',
    token,
    callback,
    query
  );
};
driver.showVolumeDetails = function (projectId, volumeId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/' + projectId + '/volumes/' + volumeId,
    token,
    callback,
    query
  );
};

driver.resizeVolume = function (projectId, volumeId, size, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2/' + projectId + '/volumes/' + volumeId + '/action',
    token,
    callback,
    {
      'os-extend': {
        new_size: size
      }
    }
  );
};

module.exports = driver;
