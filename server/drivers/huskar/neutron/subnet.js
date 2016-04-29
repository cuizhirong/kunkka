'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listSubnets = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/subnets',
    token,
    callback,
    query
  );
};
driver.showSubnetDetails = function (subnetId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/subnets/' + subnetId,
    token,
    callback,
    query
  );
};

module.exports = driver;
