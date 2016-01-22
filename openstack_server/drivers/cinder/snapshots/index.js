var request = require('superagent');
var cinderRemote = require('config')('remote').cinder;

module.exports = {
  listSnapshots: function (projectId, token, region, callback) {
    request
      .get(cinderRemote[region] + '/v2/' + projectId + '/snapshots/detail')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showSnapshotDetails: function (projectId, volumeId, token, region, callback) {
    request
      .get(cinderRemote[region] + '/v2/' + projectId + '/snapshots/' + volumeId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
