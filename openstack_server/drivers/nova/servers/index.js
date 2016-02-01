var request = require('superagent');
var novaRemote = require('config')('remote').nova;

module.exports = {
  listServers: function (projectId, token, region, callback) { // get servers list.
    request
      .get(novaRemote[region] + '/v2.1/' + projectId + '/servers/detail')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showServerDetails: function (projectId, serverId, token, region, callback) { // get single server.
    request
      .get(novaRemote[region] + '/v2.1/' + projectId + '/servers/' + serverId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
