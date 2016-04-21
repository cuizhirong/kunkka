'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverQuota = new Base('cinderQuota');

driverQuota.getQuota = function (projectId, targetId, token, region, callback, query) {
  let pid = targetId ? ('/' + targetId) : ('/' + projectId);
  return driverQuota.getMethod(
    neutronRemote[region] + '/v2.0/quotas' + pid,
    token,
    callback,
    query
  );
};

driverQuota.updateQuota = function (projectId, targetId, token, region, callback, theBody) {
  return driverQuota.putMethod(
    neutronRemote[region] + '/v2.0/quotas/' + targetId,
    token,
    callback,
    theBody
  );
};

module.exports = driverQuota;
