var neutronRemote = require('config')('remote').neutron;
var Base = require('openstack_server/drivers/base.js');
var driverPort = new Base('port');

driverPort.listPorts = function (token, region, callback, query) {
  return driverPort.getMethod(
    neutronRemote[region] + '/v2.0/ports',
    token,
    callback,
    query
  );
};
driverPort.showPortDetails = function (portId, token, region, callback) {
  return driverPort.getMethod(
    neutronRemote[region] + '/v2.0/ports/' + portId,
    token,
    callback
  );
};

module.exports = driverPort;
