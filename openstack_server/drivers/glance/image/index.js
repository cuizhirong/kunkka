var glanceRemote = require('config')('remote').glance;
var Base = require('openstack_server/drivers/base.js');
var driverImage = new Base('image');

driverImage.listImages = function (token, region, callback, query) {
  return driverImage.getMethod(
    glanceRemote[region] + '/v2/images',
    token,
    callback,
    query
  );
};
driverImage.showImageDetails = function (imageId, token, region, callback) {
  return driverImage.getMethod(
    glanceRemote[region] + '/v2/images/' + imageId,
    token,
    callback
  );
};

module.exports = driverImage;
