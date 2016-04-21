'use strict';

var Base = require('../base.js');
var driver = new Base('cinder');

driver.listSnapshots = function (projectId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2/' + projectId + '/snapshots/detail',
    token,
    callback,
    query
  );
};
driver.showSnapshotDetails = function (projectId, snapshotId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2/' + projectId + '/snapshots/' + snapshotId,
    token,
    callback,
    query
  );
};

module.exports = driver;
