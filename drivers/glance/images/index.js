var request = require('superagent');
var glanceRemote = require('config')('remote').glance;

module.exports = {
  listImages: function (token, region, callback) {
    request
      .get(glanceRemote[region] + '/v2/images')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showImageDetail: function (imageId, token, region, callback) {
    request
      .get(glanceRemote[region] + '/v2/images/' + imageId)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};
