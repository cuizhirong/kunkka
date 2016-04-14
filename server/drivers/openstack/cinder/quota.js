'use strict';

var cinderRemote = require('config')('remote').cinder;
var Base = require('../base.js');
var driverQuota = new Base('cinderQuota');

driverQuota.getQuota = function (projectId, token, region, callback, query) {
  return driverQuota.getMethod(
    cinderRemote[region] + '/v2/' + projectId + '/os-quota-sets/' + projectId,
    token,
    callback,
    query
  );
};

module.exports = driverQuota;
