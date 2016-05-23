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

let serverModule = proxyquire('../../../nova/keypair', mocks);
function callback () {}

describe('listKeypairsTest', function() {
  it('listKeypairs', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/os-keypairs',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listKeypairs('123ad', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
