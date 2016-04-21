'use strict';

var Base = require('../base.js');
var driver = new Base('keystone');

driver.getUserProjects = function (userId, token, callback, query) {
  return driver.getMethod(
    driver.remote + '/v3/users/' + userId + '/projects',
    token,
    callback,
    query
  );
};

driver.listProjects = function (token, callback, query) {
  return driver.getMethod(
    driver.remote + '/v3/projects',
    token,
    callback,
    query
  );
};

module.exports = driver;
