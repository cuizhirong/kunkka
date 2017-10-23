'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.listHosts = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.1/' + projectId + '/os-hypervisors/detail',
    token,
    callback,
    query
  );
};

/*** Promise ***/

driver.listHostsAsync = function (projectId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.1/' + projectId + '/os-hypervisors/detail',
    token,
    query
  );
};


module.exports = driver;
