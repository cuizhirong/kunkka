'use strict';

var Base = require('../base.js');
var driver = new Base('cinder');

driver.listVolumes = function (projectId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2/' + projectId + '/volumes/detail',
    token,
    callback,
    query
  );
};
driver.listVolumeTypes = function (projectId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2/' + projectId + '/types',
    token,
    callback,
    query
  );
};
driver.showVolumeDetails = function (projectId, volumeId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2/' + projectId + '/volumes/' + volumeId,
    token,
    callback,
    query
  );
};

module.exports = driver;
