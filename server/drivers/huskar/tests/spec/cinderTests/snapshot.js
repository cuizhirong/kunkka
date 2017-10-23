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

let serverModule = proxyquire('../../../cinder/snapshot', mocks);
function callback () {}

describe('listSnapshotsTest', function() {
  it('listSnapshots', function() {
    let exp = {
      url: 'regionOne/v2/123ad/snapshots/detail',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listSnapshots( '123ad', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});


describe('showSnapshotDetailsTest', function() {
  it('showSnapshotDetails', function() {
    let exp = {
      url: 'regionOne/v2/123ad/snapshots/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showSnapshotDetails('123ad', 'asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
