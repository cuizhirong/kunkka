'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.listNetworks = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/networks',
    token,
    callback,
    query
  );
};
driver.showNetworkDetails = function (networkId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/networks/' + networkId,
    token,
    callback,
    query
  );
};

driver.listExternalNetworks = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/networks',
    token,
    callback,
    {
      'router:external': true
    }
  );
};

driver.listSharedNetworks = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/networks',
    token,
    callback,
    {
      'shared': true
    }
  );
};

driver.createNetwork = function (token, remote, theBody, callback) {
  return driver.postMethod(
    remote + '/v2.0/networks',
    token,
    callback,
    theBody
  );
};

/*** Promise ***/

driver.listNetworksAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/networks',
    token,
    query
  );
};
driver.showNetworkDetailsAsync = function (networkId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/networks/' + networkId,
    token,
    query
  );
};

driver.listExternalNetworksAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/networks',
    token,
    {
      'router:external': true
    }
  );
};

driver.listSharedNetworksAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/networks',
    token,
    {
      'shared': true
    }
  );
};

driver.createNetworkAsync = function (token, remote, theBody) {
  return driver.postMethodAsync(
    remote + '/v2.0/networks',
    token,
    theBody
  );
};


module.exports = driver;
