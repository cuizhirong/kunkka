'use strict';

const proxyquire = require('proxyquire').noCallThru();

function mockBase () {

}

mockBase.prototype.getMethod = function(url, token, callbackFunc, query) {
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

let serverModule = proxyquire('../../keystone/user', mocks);
function callback () {}

describe('listUsersTest', function() {
  it('listUsers', function() {
    let exp = {
      url: 'regionOne/v3/users',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listUsers('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
