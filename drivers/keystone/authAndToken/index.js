var request = require('superagent');
var keystoneRemote = require('config')('remote').keystone;

module.exports = {
  /*
   * Password authentication with unscoped authorization
   * /v3/auth/tokens
   */
  unscopedAuth: function (username, password, callback) {
    request
      .post(keystoneRemote + '/v3/auth/tokens')
      .send({
        'auth': {
          'scope': {
            'unscoped': {}
          },
          'identity': {
            'methods': [
              'password'
            ],
            'password': {
              'user': {
                'name': username,
                'domain': {
                  'id': 'default'
                },
                'password': password
              }
            }
          }
        }
      })
      .end(callback);
  },
  scopedAuth: function (projectId, token, callback) {
    request
      .post(keystoneRemote + '/v3/auth/tokens')
      .set('X-Auth-Token', token)
      .send({
        'auth': {
          'scope': {
            'project': {
              'id': projectId
            }
          },
          'identity': {
            'token': {
              'id': token
            },
            'methods': [
              'token'
            ]
          }
        }
      })
      .end(callback);
  }
};
