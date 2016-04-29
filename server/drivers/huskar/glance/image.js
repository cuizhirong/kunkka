'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listImages = function (token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/images',
    token,
    callback,
    query
  );
};
driver.showImageDetails = function (imageId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2/images/' + imageId,
    token,
    callback,
    query
  );
};

module.exports = driver;
