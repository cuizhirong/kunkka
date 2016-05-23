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

let serverModule = proxyquire('../../../neutron/router', mocks);
function callback () {}

describe('listRoutersTest', function() {
  it('listRouters', function() {
    let exp = {
      url: 'regionOne/v2.0/routers',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listRouters('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showRouterDetailsTest', function() {
  it('showRouterDetails', function() {
    let exp = {
      url: 'regionOne/v2.0/routers/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showRouterDetails('asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
