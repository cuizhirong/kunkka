'use strict';

var Base = require('../base.js');
var driver = new Base();
const flag = (driver.noServices.indexOf('router') === -1) ? true : false;

driver.listRouters = function (token, remote, callback, query) {
  if (flag) {
    return driver.getMethod(
      remote + '/v2.0/routers',
      token,
      callback,
      query
    );
  } else {
    return {
      body: {
        routers: []
      }
    };
  }
};
driver.showRouterDetails = function (routerId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.0/routers/' + routerId,
    token,
    callback,
    query
  );
};

/*** Promise ***/

driver.listRoutersAsync = function (token, remote, query) {
  if (flag) {
    return driver.getMethodAsync(
      remote + '/v2.0/routers',
      token,
      query
    );
  } else {
    return Promise.resolve({
      body: {
        routers: []
      }
    });
  }
};
driver.showRouterDetailsAsync = function (routerId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.0/routers/' + routerId,
    token,
    query
  );
};


module.exports = driver;
