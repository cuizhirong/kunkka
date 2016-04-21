'use strict';

var Base = require('../base.js');
var driver = new Base('nova');

driver.listFlavors = function (projectId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.1/' + projectId + '/flavors/detail',
    token,
    callback,
    query
  );
};
driver.showFlavorDetails = function (projectId, flavorId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.1/' + projectId + '/flavors/' + flavorId,
    token,
    callback,
    query
  );
};
module.exports = driver;
