'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.listFlavors = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.1/' + projectId + '/flavors/detail',
    token,
    callback,
    query
  );
};
driver.showFlavorDetails = function (projectId, flavorId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.1/' + projectId + '/flavors/' + flavorId,
    token,
    callback,
    query
  );
};

/*** Promise ***/

driver.listFlavorsAsync = function (projectId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.1/' + projectId + '/flavors/detail',
    token,
    query
  );
};
driver.showFlavorDetailsAsync = function (projectId, flavorId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.1/' + projectId + '/flavors/' + flavorId,
    token,
    query
  );
};


module.exports = driver;
