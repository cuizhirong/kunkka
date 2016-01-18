var request = require('superagent');
var neutronRemote = require('config')('remote').neutron;

module.exports = {
  listPorts: function (token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/ports')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showPortDetail: function (subnetId, token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/ports/' + subnetId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
