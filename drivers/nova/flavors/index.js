var request = require('superagent');
var novaRemote = require('config')('remote').nova;

module.exports = {
  listFlavors: function (projectId, token, region, callback) {
    request
      .get(novaRemote[region] + '/v2.1/' + projectId + '/flavors/detail')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showFlavorDetail: function (projectId, flavorId, token, region, callback) {
    request
      .get(novaRemote[region] + '/v2.1/' + projectId + '/flavors/' + flavorId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
