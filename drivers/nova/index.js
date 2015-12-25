var request = require('superagent');
var config = require('config')('remote');

var Nova = {
  listServer: function(projectId, token, callback) {
    request
      .get(config.nova + '/v2.1/' + projectId + '/servers/detail')
      .set('X-Auth-Token', token)
      .end(callback);
  }
};

module.exports = Nova;
