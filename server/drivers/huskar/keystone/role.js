'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.addRoleToUserOnProject = function (projectId, userId, roleId, token, remote, callback) {
  return driver.putMethod(
    `${remote}/v3/projects/${projectId}/users/${userId}/roles/${roleId}`,
    token,
    callback
  );
};

driver.checkRole = function (projectId, userId, roleId, token, remote, callback) {
  return driver.headMethod(
    `${remote}/v3/projects/${projectId}/users/${userId}/roles/${roleId}`,
    token,
    callback
  );
};

driver.listRoles = function (token, remote, callback, query) {
  return driver.getMethod(
    `${remote}/v3/roles`,
    token,
    callback,
    query
  );
};

driver.roleAssignments = function (token, remote, query, callback) {
  return driver.getMethod(
    `${remote}/v3/role_assignments`,
    token,
    callback,
    query
  );
};

module.exports = driver;
