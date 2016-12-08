'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listPorts = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/ports',
    token,
    callback,
    query
  );
};
driver.showPortDetails = function (portId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/ports/' + portId,
    token,
    callback,
    query
  );
};

/*** Promise ***/

driver.listPortsAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/ports',
    token,
    query
  );
};
driver.showPortDetailsAsync = function (portId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/ports/' + portId,
    token,
    query
  );
};

module.exports = driver;
