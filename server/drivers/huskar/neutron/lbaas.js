'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.createLoadBalancer = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/loadbalancers',
    token,
    callback,
    theBody
  );
};
driver.createHealthMonitor = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/healthmonitors',
    token,
    callback,
    theBody
  );
};
driver.createListener = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/listeners',
    token,
    callback,
    theBody
  );
};
driver.createResourcePool = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/pools',
    token,
    callback,
    theBody
  );
};

/*** Promise ***/

module.exports = driver;
