'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverQuota = new Base('cinderQuota');

driverQuota.getQuota = function (projectId, token, region, callback, query) {
  return driverQuota.getMethod(
    neutronRemote[region] + '/v2.0/quotas/' + projectId,
    token,
    callback,
    query
  );
};

module.exports = driverQuota;
