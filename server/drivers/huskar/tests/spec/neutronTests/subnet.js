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

let serverModule = proxyquire('../../../neutron/subnet', mocks);
function callback () {}

describe('listSubnetsTest', function() {
  it('listSubnets', function() {
    let exp = {
      url: 'regionOne/v2.0/subnets',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listSubnets('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('showSubnetDetailsTest', function() {
  it('showSubnetDetails', function() {
    let exp = {
      url: 'regionOne/v2.0/subnets/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showSubnetDetails('asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
