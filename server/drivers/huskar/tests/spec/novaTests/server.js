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

mockBase.prototype.postMethod = function(url, token, callbackFunc, theBody) {
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

let serverModule = proxyquire('../../nova/server', mocks);
function callback () {}

describe('listServersTest', function() {
  it('listServers', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/servers/detail',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listServers('123ad', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showServerDetailsTest', function() {
  it('showServerDetails', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/servers/server123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showServerDetails('123ad', 'server123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('getVNCConsoleTest', function() {
  it('getVNCConsole', function() {
    let exp = {
      url: 'regionOne/v2.1/123ad/servers/server123/action',
      token: 'asdf',
      callback: callback,
      theBody: '123'
    };
    let result = serverModule.getVNCConsole('123ad', 'server123', 'asdf', 'regionOne', callback, '123');
    expect(result).toEqual(exp);
  });
});
