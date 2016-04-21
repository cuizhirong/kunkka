'use strict';

var Base = require('../base.js');
var driver = new Base('glance');

driver.listImages = function (token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2/images',
    token,
    callback,
    query
  );
};
driver.showImageDetails = function (imageId, token, region, callback, query) {
  return driver.getMethod(
    driver.remote[region] + '/v2/images/' + imageId,
    token,
    callback,
    query
  );
};

module.exports = driver;
