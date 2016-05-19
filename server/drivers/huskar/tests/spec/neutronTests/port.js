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

let serverModule = proxyquire('../../neutron/port', mocks);
function callback () {}

describe('listPortsTest', function() {
  it('listPorts', function() {
    let exp = {
      url: 'regionOne/v2.0/ports',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listPorts('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showPortDetailsTest', function() {
  it('showPortDetails', function() {
    let exp = {
      url: 'regionOne/v2.0/ports/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showPortDetails('asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
