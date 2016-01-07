var request = require('superagent');
var cinderRemote = require('config')('remote').cinder;

var Cinder = {
  listVolumes: function(projectId, token, callback) {
    request
      .get(cinderRemote + '/v2/' + projectId + '/volumes/detail')
      .set('X-Auth-Token', token)
      .end(callback);
  }
};

module.exports = Cinder;
