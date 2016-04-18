'use strict';

var request = require('superagent');
var keystoneRemote = require('config')('remote').keystone;

module.exports = {
  getUserProjects: function(userId, token, callback) {
    request
      .get(keystoneRemote + '/v3/users/' + userId + '/projects')
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
