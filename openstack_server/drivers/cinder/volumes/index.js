var request = require('superagent');
var cinderRemote = require('config')('remote').cinder;

module.exports = {
  listVolumes: function (projectId, token, region, callback) {
    request
      .get(cinderRemote[region] + '/v2/' + projectId + '/volumes/detail')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showVolumeDetails: function (projectId, volumeId, token, region, callback) {
    request
      .get(cinderRemote[region] + '/v2/' + projectId + '/volumes/' + volumeId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
