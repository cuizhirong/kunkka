'use strict';

var novaRemote = require('config')('remote').nova;
var Base = require('../base.js');
var driverQuota = new Base('novaQuota');

driverQuota.getQuota = function (projectId, targetId, token, region, callback, query) {
  let pid = targetId ? targetId : projectId;
  return driverQuota.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/os-quota-sets/' + pid,
    token,
    callback,
    query
  );
};

module.exports = driverQuota;
