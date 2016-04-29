'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listRouters = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/routers',
    token,
    callback,
    query
  );
};
driver.showRouterDetails = function (routerId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/routers/' + routerId,
    token,
    callback,
    query
  );
};

module.exports = driver;
