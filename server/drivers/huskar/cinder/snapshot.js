'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listSnapshots = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/' + projectId + '/snapshots/detail',
    token,
    callback,
    query
  );
};
driver.showSnapshotDetails = function (projectId, snapshotId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/' + projectId + '/snapshots/' + snapshotId,
    token,
    callback,
    query
  );
};

module.exports = driver;
