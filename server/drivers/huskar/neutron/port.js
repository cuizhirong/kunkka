'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverPort = new Base('port');

driverPort.listPorts = function (token, region, callback, query) {
  return driverPort.getMethod(
    neutronRemote[region] + '/v2.0/ports',
    token,
    callback,
    query
  );
};
driverPort.showPortDetails = function (portId, token, region, callback, query) {
  return driverPort.getMethod(
    neutronRemote[region] + '/v2.0/ports/' + portId,
    token,
    callback,
    query
  );
};

module.exports = driverPort;
