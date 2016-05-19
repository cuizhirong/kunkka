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

let serverModule = proxyquire('../../nova/flavor', mocks);
function callback () {}

describe('listFlavorsTest', function() {
  it('listFlavors', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/flavors/detail',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listFlavors('123ad', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showFlavorDetailsTest', function() {
  it('showFlavorDetails', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/flavors/server123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showFlavorDetails('123ad', 'server123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
