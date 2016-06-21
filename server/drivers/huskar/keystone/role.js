'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.addRoleToUserOnProject = function (projectId, userId, roleId, token, remote, callback, query) {
  return driver.putMethod(
    `${remote}/v3/projects/${projectId}/users/${userId}/roles/${roleId}`,
    token,
    callback,
    query
  );
};

module.exports = driver;
