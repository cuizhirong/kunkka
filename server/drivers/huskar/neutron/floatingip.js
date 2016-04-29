'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listFloatingips = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/floatingips',
    token,
    callback,
    query
  );
};
driver.showFloatingipDetails = function (id, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/floatingips/' + id,
    token,
    callback,
    query
  );
};

module.exports = driver;
