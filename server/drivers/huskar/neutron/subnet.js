'use strict';

var Base = require('../base.js');
var driver = new Base('neutron');

driver.listSubnets = function (token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/subnets',
    token,
    callback,
    query
  );
};
driver.showSubnetDetails = function (subnetId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/subnets/' + subnetId,
    token,
    callback,
    query
  );
};

module.exports = driver;
