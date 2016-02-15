var request = require('superagent');
var neutronRemote = require('config')('remote').neutron;

module.exports = {
  listPorts: function (token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/ports')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showPortDetails: function (portId, token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/ports/' + portId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
