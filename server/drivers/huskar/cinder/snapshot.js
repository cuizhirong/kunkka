'use strict';

var cinderRemote = require('config')('remote').cinder;
var Base = require('../base.js');
var driverSnapshot = new Base('snapshot');

driverSnapshot.listSnapshots = function (projectId, token, region, callback, query) {
  return driverSnapshot.getMethod(
    cinderRemote[region] + '/v2/' + projectId + '/snapshots/detail',
    token,
    callback,
    query
  );
};
driverSnapshot.showSnapshotDetails = function (projectId, snapshotId, token, region, callback, query) {
  return driverSnapshot.getMethod(
    cinderRemote[region] + '/v2/' + projectId + '/snapshots/' + snapshotId,
    token,
    callback,
    query
  );
};

module.exports = driverSnapshot;
