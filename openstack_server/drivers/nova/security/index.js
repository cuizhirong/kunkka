var novaRemote = require('config')('remote').nova;
var Base = require('openstack_server/drivers/base.js');
var driverSecurity = new Base('security');

driverSecurity.listSecurity = function (projectId, token, region, callback, query) {
  return driverSecurity.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/os-security-groups',
    token,
    callback,
    query
  );
};
driverSecurity.showSecurityDetails = function (projectId, securityId, token, region, callback) {
  return driverSecurity.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/os-security-groups/' + securityId,
    token,
    callback
  );
};
module.exports = driverSecurity;
