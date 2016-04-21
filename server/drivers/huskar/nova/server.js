'use strict';

var Base = require('../base.js');
var driver = new Base('nova');

driver.listServers = function (projectId, token, region, callback, query) { // get servers list.
  return driver.getMethod(
    driver.remote[region] + '/v2.1/' + projectId + '/servers/detail',
    token,
    callback,
    query
  );
};
driver.showServerDetails = function (projectId, serverId, token, region, callback, query) { // get single server.
  return driver.getMethod(
    driver.remote[region] + '/v2.1/' + projectId + '/servers/' + serverId,
    token,
    callback,
    query
  );
};

module.exports = driver;
