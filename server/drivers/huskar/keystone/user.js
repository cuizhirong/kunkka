'use strict';

const Base = require('../base.js');
const driver = new Base();

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
driver.updateUser = function (token, remote, userId, payload, callback) {
  return driver.patchMethod(
    remote + '/v3/users/' + userId,
    token,
    callback,
    payload
  );
};

driver.changePassword = function (token, remote, userId, payload, callback) {
  return driver.postMethod(
    remote + '/v3/users/' + userId + '/password',
    token,
    callback,
    payload
  );
};

/*** Promise ***/
driver.listUsersAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v3/users',
    token,
    query
  );
};

driver.getUserAsync = function (token, remote, userId) {
  return driver.getMethodAsync(
    remote + '/v3/users/' + userId,
    token
  );
};

driver.createUserAsync = function (token, remote, payload) {
  return driver.postMethodAsync(
    remote + '/v3/users',
    token,
    payload
  );
};
driver.updateUserAsync = function (token, remote, userId, payload) {
  return driver.patchMethodAsync(
    remote + '/v3/users/' + userId,
    token,
    payload
  );
};

driver.changePasswordAsync = function (token, remote, userId, payload) {
  return driver.postMethodAsync(
    remote + '/v3/users/' + userId + '/password',
    token,
    payload
  );
};

driver.deleteUserAsync = driver.delUserAsync = function (token, remote, userId) {
  return driver.delMethodAsync(
    remote + '/v3/users/' + userId,
    token
  );
};

module.exports = driver;
