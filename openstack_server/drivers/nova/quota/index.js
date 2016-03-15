var novaRemote = require('config')('remote').nova;
var Base = require('openstack_server/drivers/base.js');
var driverQuota = new Base('novaQuota');

driverQuota.getQuota = function (projectId, token, region, callback, query) {
  return driverQuota.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/os-quota-sets/' + projectId,
    token,
    callback,
    query
  );
};

module.exports = driverQuota;
