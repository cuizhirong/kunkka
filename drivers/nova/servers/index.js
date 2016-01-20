var request = require('superagent');
var novaRemote = require('config')('remote').nova;

module.exports = {
  listServers: function (projectId, token, region, callback) {
    request
      .get(novaRemote[region] + '/v2.1/' + projectId + '/servers/detail')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showServerDetails: function (projectId, serverId, token, region, callback) {
    request
      .get(novaRemote[region] + '/v2.1/' + projectId + '/servers/' + serverId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
