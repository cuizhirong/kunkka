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

let serverModule = proxyquire('../../../neutron/security', mocks);
function callback () {}

describe('listSecurityTest', function() {
  it('listSecurity', function() {
    let exp = {
      url: 'regionOne/v2.0/security-groups',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listSecurity('asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showSecurityDetailsTest', function() {
  it('showSecurityDetails', function() {
    let exp = {
      url: 'regionOne/v2.0/security-groups/df123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showSecurityDetails('asd123', 'df123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
