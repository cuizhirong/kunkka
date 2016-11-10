'use strict';

var Base = require('../base.js');
var driver = new Base();


/*** Promise ***/
driver.assignRoleToUserOnProjectInSubtreeAsync = function (projectId, userId, roleId, token, remote) {
  return driver.putMethodAsync(
    `${remote}/v3/OS-INHERIT/projects/${projectId}/users/${userId}/roles/${roleId}/inherited_to_projects`,
    token
  );
};

module.exports = driver;
