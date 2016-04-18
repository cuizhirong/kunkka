'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverSecurity = new Base('security');

driverSecurity.listSecurity = function (projectId, token, region, callback, query) {
  return driverSecurity.getMethod(
    neutronRemote[region] + '/v2.0/security-groups',
    token,
    callback,
    query
  );
};
driverSecurity.showSecurityDetails = function (projectId, securityId, token, region, callback, query) {
  return driverSecurity.getMethod(
    neutronRemote[region] + '/v2.0/security-groups/' + securityId,
    token,
    callback,
    query
  );
};
module.exports = driverSecurity;
