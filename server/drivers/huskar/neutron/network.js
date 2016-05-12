'use strict';

var Base = require('../base.js');
var driver = new Base();

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

module.exports = driver;
