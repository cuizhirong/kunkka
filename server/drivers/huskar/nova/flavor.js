'use strict';

var Base = require('../base.js');
var driver = new Base();

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


module.exports = driver;
