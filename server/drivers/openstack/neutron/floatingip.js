'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverFloatingip = new Base('floatingip');

driverFloatingip.listFloatingips = function (token, region, callback, query) {
  return driverFloatingip.getMethod(
    neutronRemote[region] + '/v2.0/floatingips',
    token,
    callback,
    query
  );
};
driverFloatingip.showFloatingipDetails = function (id, token, region, callback, query) {
  return driverFloatingip.getMethod(
    neutronRemote[region] + '/v2.0/floatingips/' + id,
    token,
    callback,
    query
  );
};

module.exports = driverFloatingip;
