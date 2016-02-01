var request = require('superagent');
var novaRemote = require('config')('remote').nova;

module.exports = {
  listSecurity: function (projectId, token, region, callback) {
    request
      .get(novaRemote[region] + '/v2.1/' + projectId + '/os-security-groups')
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
