var request = require('superagent');
var novaRemote = require('config')('remote').nova;

module.exports = {
  getVNCConsole: function (projectId, serverId, token, region, callback) {
    request
      .post(novaRemote[region] + '/v2.1/' + projectId + '/servers/' + serverId + '/action')
      .send({
        'os-getVNCConsole': {
          'type': 'novnc'
        }
      })
      .set('X-Auth-Token', token)
      .end(callback);
  },
  getConsoleOutput: function (projectId, serverId, token, region, callback) {
    request
      .post(novaRemote[region] + '/v2.1/' + projectId + '/servers/' + serverId + '/action')
      .send({
        'os-getConsoleOutput': {
          'length': -1
        }
      })
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
