'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listUsers = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v3/users',
    token,
    callback,
    query
  );
};

driver.createUser = function (token, remote, payload, callback) {
  return driver.postMethod(
    remote + '/v3/users',
    token,
    callback,
    payload
  );
};

module.exports = driver;
