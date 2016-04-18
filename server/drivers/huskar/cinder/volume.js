'use strict';

var cinderRemote = require('config')('remote').cinder;
var Base = require('../base.js');
var driverVolume = new Base('volume');

driverVolume.listVolumes = function (projectId, token, region, callback, query) {
  return driverVolume.getMethod(
    cinderRemote[region] + '/v2/' + projectId + '/volumes/detail',
    token,
    callback,
    query
  );
};
driverVolume.listVolumeTypes = function (projectId, token, region, callback, query) {
  return driverVolume.getMethod(
    cinderRemote[region] + '/v2/' + projectId + '/types',
    token,
    callback,
    query
  );
};
driverVolume.showVolumeDetails = function (projectId, volumeId, token, region, callback, query) {
  return driverVolume.getMethod(
    cinderRemote[region] + '/v2/' + projectId + '/volumes/' + volumeId,
    token,
    callback,
    query
  );
};

module.exports = driverVolume;
