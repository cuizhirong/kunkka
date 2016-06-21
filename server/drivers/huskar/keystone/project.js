'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.getUserProjects = function (userId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v3/users/' + userId + '/projects',
    token,
    callback,
    query
  );
};

driver.listProjects = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v3/projects',
    token,
    callback,
    query
  );
};

driver.createProject = function (token, remote, callback, payload) {
  return driver.postMethod(
    remote + '/v3/projects',
    token,
    callback,
    payload
  );
};

module.exports = driver;
