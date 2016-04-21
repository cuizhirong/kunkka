'use strict';

var request = require('superagent');
var Base = require('../base.js');
var driver = new Base('keystone');

module.exports = {
  /*
   * Password authentication with unscoped authorization
   * /v3/auth/tokens
   */
  unscopedAuth: function (username, password, domain, callback) {
    request
      .post(driver.remote + '/v3/auth/tokens')
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
                  'name': domain
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
      .post(driver.remote + '/v3/auth/tokens')
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
