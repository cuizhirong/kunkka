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

driver.getUser = function (token, remote, userId, callback) {
  return driver.getMethod(
    remote + '/v3/users/' + userId,
    token,
    callback
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
//TODO
driver.updateUser = function (token, remote, userId, payload, callback) {
  return driver.patchMethod(
    remote + '/v3/users/' + userId,
    token,
    callback,
    payload
  );
};

module.exports = driver;
