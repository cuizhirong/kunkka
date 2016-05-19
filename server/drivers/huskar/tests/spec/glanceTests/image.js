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

let serverModule = proxyquire('../../glance/image', mocks);
function callback () {}

describe('listImagesTest', function() {
  it('listImages', function() {
    let exp = {
      url: 'regionOne/v2/images',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listImages('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('showImageDetailsTest', function() {
  it('showImageDetails', function() {
    let exp = {
      url: 'regionOne/v2/images/asd123',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.showImageDetails('asd123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
