var request = require('superagent');
var neutronRemote = require('config')('remote').neutron;

module.exports = {
  listRouters: function (token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/routers')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showRouterDetails: function (routerId, token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/routers/' + routerId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
