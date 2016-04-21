'use strict';

var Base = require('../base.js');
var driver = new Base('neutron');

driver.listSecurity = function (projectId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/security-groups',
    token,
    callback,
    query
  );
};
driver.showSecurityDetails = function (projectId, securityId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/security-groups/' + securityId,
    token,
    callback,
    query
  );
};
module.exports = driver;
