'use strict';

var glanceRemote = require('config')('remote').glance;
var Base = require('../base.js');
var driverImage = new Base('image');

driverImage.listImages = function (token, region, callback, query) {
  return driverImage.getMethod(
    glanceRemote[region] + '/v2/images',
    token,
    callback,
    query
  );
};
driverImage.showImageDetails = function (imageId, token, region, callback, query) {
  return driverImage.getMethod(
    glanceRemote[region] + '/v2/images/' + imageId,
    token,
    callback,
    query
  );
};

module.exports = driverImage;
