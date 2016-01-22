var request = require('superagent');
var neutronRemote = require('config')('remote').neutron;

module.exports = {
  listSubnets: function (token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/subnets')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showSubnetDetails: function (subnetId, token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/subnets/' + subnetId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
