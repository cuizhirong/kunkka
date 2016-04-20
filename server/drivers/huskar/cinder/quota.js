'use strict';

var cinderRemote = require('config')('remote').cinder;
var Base = require('../base.js');
var driverQuota = new Base('cinderQuota');

driverQuota.getQuota = function (projectId, targetId, token, region, callback, query) {
  let pid = targetId ? targetId : projectId;
  return driverQuota.getMethod(
    cinderRemote[region] + '/v2/' + projectId + '/os-quota-sets/' + pid,
    token,
    callback,
    query
  );
};

module.exports = driverQuota;
