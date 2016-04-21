'use strict';

var Base = require('../base.js');
var driver = new Base('neutron');

driver.listPorts = function (token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/ports',
    token,
    callback,
    query
  );
};
driver.showPortDetails = function (portId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/ports/' + portId,
    token,
    callback,
    query
  );
};

module.exports = driver;
