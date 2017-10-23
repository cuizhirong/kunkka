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

let serverModule = proxyquire('../../../neutron/floatingip', mocks);
function callback () {}

describe('listFloatingipsTest', function() {
  it('listFloatingips', function() {
    let exp = {
      url: 'regionOne/v2.0/floatingips',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listFloatingips('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showFloatingipDetailsTest', function() {
  it('showFloatingipDetails', function() {
    let exp = {
      url: 'regionOne/v2.0/floatingips/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showFloatingipDetails('asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
