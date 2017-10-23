'use strict';

const Base = require('../base.js');
const driver = new Base();

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

/*** Promise ***/
driver.listVolumesAsync = function (projectId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2/' + projectId + '/volumes/detail',
    token,
    query
  );
};
driver.listVolumeTypesAsync = function (projectId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2/' + projectId + '/types',
    token,
    query
  );
};
driver.showVolumeDetailsAsync = function (projectId, volumeId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2/' + projectId + '/volumes/' + volumeId,
    token,
    query
  );
};

driver.resizeVolumeAsync = function (projectId, volumeId, size, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2/' + projectId + '/volumes/' + volumeId + '/action',
    token, {
      'os-extend': {
        new_size: size
      }
    }
  );
};

module.exports = driver;
