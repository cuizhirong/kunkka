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

let serverModule = proxyquire('../../../neutron/network', mocks);
function callback () {}

describe('listNetworksTest', function() {
  it('listNetworks', function() {
    let exp = {
      url: 'regionOne/v2.0/networks',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listNetworks('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showNetworkDetailsTest', function() {
  it('showNetworkDetails', function() {
    let exp = {
      url: 'regionOne/v2.0/networks/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showNetworkDetails('asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('listExternalNetworksTest', function() {
  it('listExternalNetworks', function() {
    let exp = {
      url: 'regionOne/v2.0/networks',
      token: 'asdf',
      callback: callback,
      query: {'router:external': true}
    };
    let result = serverModule.listExternalNetworks('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('listSharedNetworksTest', function() {
  it('listSharedNetworks', function() {
    let exp = {
      url: 'regionOne/v2.0/networks',
      token: 'asdf',
      callback: callback,
      query: {'shared': true}
    };
    let result = serverModule.listSharedNetworks('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
