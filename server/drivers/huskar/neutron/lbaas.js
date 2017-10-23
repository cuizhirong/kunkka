'use strict';

const Base = require('../base.js');
const driver = new Base();

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
driver.listLoadBalancers = (token, remote, callback, query) => {
  return driver.getMethod(
    remote + '/v2.0/lbaas/loadbalancers',
    token,
    callback,
    query
  );
};
driver.listListeners = (token, remote, callback, query) => {
  return driver.getMethod(
    remote + '/v2.0/lbaas/listeners',
    token,
    callback,
    query
  );
};
driver.listPools = (token, remote, callback, query) => {
  return driver.getMethod(
    remote + '/v2.0/lbaas/pools',
    token,
    callback,
    query
  );
};


/*** Promise ***/

driver.createLoadBalancerAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/loadbalancers',
    token,
    theBody
  );
};
driver.createHealthMonitorAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/healthmonitors',
    token,
    theBody
  );
};
driver.createListenerAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/listeners',
    token,
    theBody
  );
};
driver.createResourcePoolAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/pools',
    token,
    theBody
  );
};
driver.listLoadBalancersAsync = (token, remote, query) => {
  return driver.getMethodAsync(
    remote + '/v2.0/lbaas/loadbalancers',
    token,
    query
  );
};
driver.listListenersAsync = (token, remote, query) => {
  return driver.getMethodAsync(
    remote + '/v2.0/lbaas/listeners',
    token,
    query
  );
};
driver.listPoolsAsync = (token, remote, query) => {
  return driver.getMethodAsync(
    remote + '/v2.0/lbaas/pools',
    token,
    query
  );
};

module.exports = driver;
