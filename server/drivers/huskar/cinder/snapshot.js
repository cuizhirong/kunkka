'use strict';

const qs = require('querystring');

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
// because api return max number of items in a single response
// need recursive retrieve all items
driver.listSnapshotsRecursive = function listSnapshotsRecursive(link, snapshots, obj, callback) {
  const nextLinkHref = link[0].href;
  const linkUrlQuery = nextLinkHref.split('?')[1];
  const marker = qs.parse(linkUrlQuery).marker || '';
  obj.query.marker = marker;
  driver.listSnapshots(obj.projectId, obj.token, obj.remote, (err, payload) => {
    if (err) {
      callback(err);
    } else {
      const result = payload.body;
      snapshots = snapshots.concat(result.snapshots);
      if (result.snapshots_links) {
        listSnapshotsRecursive(result.snapshots_links, snapshots, obj, callback);
      } else {
        callback(null, {snapshots});
      }
    }
  }, obj.query);
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
