'use strict';

const Base = require('../base.js');
const driver = new Base();

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

driver.createSubnet = function (token, remote, theBody, callback) {
  return driver.postMethod(
    remote + '/v2.0/subnets',
    token,
    callback,
    theBody
  );
};

/*** Promise ***/

driver.listSubnetsAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/subnets',
    token,
    query
  );
};
driver.showSubnetDetailsAsync = function (subnetId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/subnets/' + subnetId,
    token,
    query
  );
};
driver.createSubnetAsync = function (token, remote, theBody) {
  return driver.postMethodAsync(
    remote + '/v2.0/subnets',
    token,
    theBody
  );
};

module.exports = driver;
