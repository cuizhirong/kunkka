'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.listUsersInGroup = (token, remote, groupId, callback) => {
  return driver.getMethod(
    `${remote}/v3/groups/${groupId}/users`,
    token,
    callback
  );
};

/*** Promise ***/
driver.listUsersInGroupAsync = (token, remote, groupId) => {
  return driver.getMethodAsync(
    `${remote}/v3/groups/${groupId}/users`,
    token
  );
};

driver.listGroupsAsync = (token, remote, query) => {
  return driver.getMethodAsync(
    `${remote}/v3/groups`,
    token,
    query
  );
};

driver.getGroupAsync = (token, remote, groupId) => {
  return driver.getMethodAsync(
    `${remote}/v3/groups/${groupId}`,
    token
  );
};

module.exports = driver;
