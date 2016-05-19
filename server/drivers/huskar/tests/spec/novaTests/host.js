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

let serverModule = proxyquire('../../nova/host', mocks);
function callback () {}

describe('listHostsTest', function() {
  it('listHosts', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/os-hypervisors/detail',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listHosts('123ad', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
