'use strict';

var Base = require('../base.js');
var driver = new Base('neutron');

driver.listNetworks = function (token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/networks',
    token,
    callback,
    query
  );
};
driver.showNetworkDetails = function (networkId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/networks/' + networkId,
    token,
    callback,
    query
  );
};

module.exports = driver;
