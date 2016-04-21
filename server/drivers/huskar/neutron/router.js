'use strict';

var Base = require('../base.js');
var driver = new Base('neutron');

driver.listRouters = function (token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/routers',
    token,
    callback,
    query
  );
};
driver.showRouterDetails = function (routerId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2.0/routers/' + routerId,
    token,
    callback,
    query
  );
};

module.exports = driver;
