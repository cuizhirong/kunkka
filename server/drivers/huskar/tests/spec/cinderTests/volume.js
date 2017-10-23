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

let serverModule = proxyquire('../../../cinder/volume', mocks);
function callback () {}

describe('listVolumesTest', function() {
  it('listVolumes', function() {
    let exp = {
      url: 'regionOne/v2/123ad/volumes/detail',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listVolumes('123ad', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('listVolumeTypesTest', function() {
  it('listVolumeTypes', function() {
    let exp = {
      url: 'regionOne/v2/123ad/types',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listVolumeTypes('123ad', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('showVolumeDetailsTest', function() {
  it('showVolumeDetails', function() {
    let exp = {
      url: 'regionOne/v2/123ad/volumes/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showVolumeDetails('123ad', 'asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
