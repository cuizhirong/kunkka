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

let serverModule = proxyquire('../../keystone/project', mocks);
function callback () {}

describe('getUserProjectsTest', function() {
  it('getUserProjects', function() {
    let exp = {
      url: 'regionOne/v3/users/qwe123/projects',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.getUserProjects('qwe123', 'asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});

describe('listProjectsTest', function() {
  it('listProjects', function() {
    let exp = {
      url: 'regionOne/v3/projects',
      token: 'asdf',
      callback: callback,
      query: {'ab':123}
    };
    let result = serverModule.listProjects('asdf', 'regionOne', callback, {'ab':123});
    expect(result).toEqual(exp);
  });
});
