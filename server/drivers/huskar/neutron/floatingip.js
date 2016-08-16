'use strict';

var Base = require('../base.js');
var driver = new Base();
const flag = (driver.noServices.indexOf('floatingip') === -1) ? true : false;

driver.listFloatingips = function (token, remote, callback, query) {
  if (flag) {
    return driver.getMethod(
      remote + '/v2.0/floatingips',
      token,
      callback,
      query
    );
  } else {
    return {
      body: {
        floatingips: []
      }
    };
  }
};
driver.showFloatingipDetails = function (id, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/floatingips/' + id,
    token,
    callback,
    query
  );
};

driver.resizeFloatingip = function (floatingipId, size, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/floatingips/' + floatingipId + '/update_floatingip_ratelimit',
    token,
    callback,
    {
      floatingip: {
        rate_limit: size
      }
    }
  );
};

module.exports = driver;
