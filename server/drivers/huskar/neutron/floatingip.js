'use strict';

var Base = require('../base.js');
var driver = new Base('neutron');

driver.listFloatingips = function (token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/floatingips',
    token,
    callback,
    query
  );
};
driver.showFloatingipDetails = function (id, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/floatingips/' + id,
    token,
    callback,
    query
  );
};

module.exports = driver;
