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

mockBase.prototype.putMethod = function(url, token, callbackFunc, theBody) {
  return {
    url: url,
    token: token,
    callback: callbackFunc,
    theBody: theBody
  };
};

const mocks = {
  '../base.js': mockBase
};

let serverModule = proxyquire('../../nova/quota', mocks);
function callback () {}

describe('getQuotaTest', function() {
  it('getQuota', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/os-quota-sets/123qwe',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.getQuota('123ad', '123qwe', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('updateQuotaTest', function() {
  it('updateQuota', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/os-quota-sets/123qwe',
      token: 'asdf',
      callback: callback,
      theBody: 'ab123'
    };
    let result = serverModule.updateQuota('123ad', '123qwe', 'asdf', 'regionOne', callback, 'ab123');
    expect(result).toEqual(exp);
  });
});
