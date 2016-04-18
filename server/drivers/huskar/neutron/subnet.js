'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverSubnet = new Base('subnet');

driverSubnet.listSubnets = function (token, region, callback, query) {
  return driverSubnet.getMethod(
    neutronRemote[region] + '/v2.0/subnets',
    token,
    callback,
    query
  );
};
driverSubnet.showSubnetDetails = function (subnetId, token, region, callback, query) {
  return driverSubnet.getMethod(
    neutronRemote[region] + '/v2.0/subnets/' + subnetId,
    token,
    callback,
    query
  );
};

module.exports = driverSubnet;
