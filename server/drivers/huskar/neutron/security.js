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
driver.createSecurityGroupRule = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/security-group-rules',
    token,
    callback,
    theBody
  );
};

/*** Promise ***/


module.exports = driver;
