'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listSecurity = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/security-groups',
    token,
    callback,
    query
  );
};
driver.showSecurityDetails = function (projectId, securityId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/security-groups/' + securityId,
    token,
    callback,
    query
  );
};
module.exports = driver;
