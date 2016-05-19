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

let serverModule = proxyquire('../../cinder/quota', mocks);
function callback () {}

describe('getQuotaTest', function() {
  it('getQuota', function() {
    let exp = {
      url: 'regionOne/v2/asd123/os-quota-sets/qwe123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.getQuota('asd123', 'qwe123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('getQuotaTest', function() {
  it('getQuota', function() {
    let exp = {
      url: 'regionOne/v2/asd123/os-quota-sets/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.getQuota('asd123', '', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('updateQuotaTest', function() {
  it('updateQuota', function() {
    let exp = {
      url: 'regionOne/v2/asd123/os-quota-sets/qwe123',
      token: 'asdf',
      callback: callback,
      theBody: {'ab':123}
    };
    let result = serverModule.updateQuota('asd123', 'qwe123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
