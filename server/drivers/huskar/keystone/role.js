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

/*** Promise ***/
driver.addRoleToUserOnProjectAsync = function (projectId, userId, roleId, token, remote) {
  return driver.putMethodAsync(
    `${remote}/v3/projects/${projectId}/users/${userId}/roles/${roleId}`,
    token
  );
};

driver.removeRoleToUserOnProjectAsync = function (projectId, userId, roleId, token, remote) {
  return driver.delMethodAsync(
    `${remote}/v3/projects/${projectId}/users/${userId}/roles/${roleId}`,
    token
  );
};

driver.checkRoleAsync = function (projectId, userId, roleId, token, remote) {
  return driver.headMethodAsync(
    `${remote}/v3/projects/${projectId}/users/${userId}/roles/${roleId}`,
    token
  );
};

driver.listRolesAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    `${remote}/v3/roles`,
    token,
    query
  );
};

driver.roleAssignmentsAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    `${remote}/v3/role_assignments`,
    token,
    query
  );
};

driver.createRoleAsync = function (token, remote, body) {
  return driver.postMethodAsync(
    `${remote}/v3/roles`,
    token,
    body
  );
};
driver.getRoleAsync = function (token, remote, roleId) {
  return driver.getMethodAsync(
    `${remote}/v3/roles/${roleId}`,
    token
  );
};

module.exports = driver;
