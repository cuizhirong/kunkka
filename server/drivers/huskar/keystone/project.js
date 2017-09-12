'use strict';

const Base = require('../base.js');
const driver = new Base();

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

/*** Promise ***/
driver.getUserProjectsAsync = function (userId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v3/users/' + userId + '/projects',
    token,
    query
  );
};

driver.listProjectsAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v3/projects',
    token,
    query
  );
};

driver.createProjectAsync = function (token, remote, payload) {
  return driver.postMethodAsync(
    remote + '/v3/projects',
    token,
    payload
  );
};

driver.getProjectAsync = function (token, remote, projectId) {
  return driver.getMethodAsync(
    remote + '/v3/projects/' + projectId,
    token
  );
};

driver.updateProjectAsync = function (token, remote, projectId, payload) {
  return driver.patchMethodAsync(
    remote + '/v3/projects/' + projectId,
    token,
    payload
  );
};

driver.deleteProjectAsync = driver.delProjectAsync = function (token, remote, projectId) {
  return driver.delMethodAsync(
    remote + '/v3/projects/' + projectId,
    token
  );
};

module.exports = driver;
