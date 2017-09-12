'use strict';

const Base = require('../base.js');
const driver = new Base();

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

/*** Promise ***/
driver.listSnapshotsAsync = function (projectId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2/' + projectId + '/snapshots/detail',
    token,
    query
  );
};
driver.showSnapshotDetailsAsync = function (projectId, snapshotId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2/' + projectId + '/snapshots/' + snapshotId,
    token,
    query
  );
};
driver.createSnapshotAsync = function (projectId, token, remote, theBody) {
  return driver.postMethodAsync(
    remote + '/v2/' + projectId + '/snapshots',
    token,
    theBody
  );
};

module.exports = driver;
