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
driver.createSnapshot = function (projectId, token, remote, theBody, callback) {
  return driver.postMethod(
    remote + '/v2/' + projectId + '/snapshots',
    token,
    callback,
    theBody
  );
};

module.exports = driver;
