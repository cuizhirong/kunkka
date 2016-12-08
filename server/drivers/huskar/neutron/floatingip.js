'use strict';

var Base = require('../base.js');
var driver = new Base();
const flag = (driver.noServices.indexOf('floatingip') === -1);

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
  return driver.putMethod(
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

driver.createFloatingip = function (floatingNetworkId, size, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/floatingips',
    token,
    callback,
    {
      floatingip: {
        floating_network_id: floatingNetworkId,
        rate_limit: size
      }
    }
  );
};

/*** Promise ***/

driver.listFloatingipsAsync = function (token, remote, query) {
  if (flag) {
    return driver.getMethodAsync(
      remote + '/v2.0/floatingips',
      token,
      query
    );
  } else {
    return Promise.resolve({
      body: {
        floatingips: []
      }
    });
  }
};
driver.showFloatingipDetailsAsync = function (id, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/floatingips/' + id,
    token,
    query
  );
};

driver.resizeFloatingipAsync = function (floatingipId, size, token, remote) {
  return driver.putMethodAsync(
    remote + '/v2.0/floatingips/' + floatingipId + '/update_floatingip_ratelimit',
    token,
    {
      floatingip: {
        rate_limit: size
      }
    }
  );
};

driver.createFloatingipAsync = function (floatingNetworkId, size, token, remote, callback) {
  return driver.postMethodAsync(
    remote + '/v2.0/floatingips',
    token,
    {
      floatingip: {
        floating_network_id: floatingNetworkId,
        rate_limit: size
      }
    }
  );
};


module.exports = driver;
