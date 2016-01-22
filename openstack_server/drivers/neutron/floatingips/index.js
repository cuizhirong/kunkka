var request = require('superagent');
var neutronRemote = require('config')('remote').neutron;

module.exports = {
  listFloatingips: function (token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/floatingips')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showFloatingipDetails: function (id, token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/floatingips/' + id)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
