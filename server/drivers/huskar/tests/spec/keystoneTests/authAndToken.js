'use strict';

const proxyquire = require('proxyquire').noCallThru();

function mockBase () {

}

mockBase.prototype.postMethod = function(url, token, callbackFunc, query) {
  return {
    url: url,
    token: token,
    callback: callbackFunc,
    query: query
  };
};

const mocks = {
  '../base.js': mockBase
};

let serverModule = proxyquire('../../keystone/authAndToken', mocks);
function callback () {}

describe('unscopedAuthTest', function() {
  it('unscopedAuth', function() {
    let exp = {
      url: 'regionOne/v3/auth/tokens',
      token: null,
      callback: callback,
      query: {
        'auth': {
          'scope': {
            'unscoped': {}
          },
          'identity': {
            'methods':[
              'password'
            ],
            'password': {
              'user': {
                'name': 'qwe123',
                'domain': {
                  'name': 'zxc123'
                },
                'password': 'asd123'
              }
            }
          }
        }
      }
    };
    let result = serverModule.unscopedAuth('qwe123', 'asd123', 'zxc123', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('scopedAuthTest', function() {
  it('scopedAuth', function() {
    let exp = {
      url: 'regionOne/v3/auth/tokens',
      token: 'asdf',
      callback: callback,
      query: {
        'auth': {
          'scope': {
            'project': {
              'id': 'qwe123'
            }
          },
          'identity': {
            'token': {
              'id': 'asdf'
            },
            'methods': [
              'token'
            ]
          }
        }
      }
    };
    let result = serverModule.scopedAuth('qwe123', 'asdf', 'regionOne', callback);
    expect(result).toEqual(exp);
  });
});
