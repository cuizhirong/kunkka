'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverRouter = new Base('router');

driverRouter.listRouters = function (token, region, callback, query) {
  return driverRouter.getMethod(
    neutronRemote[region] + '/v2.0/routers',
    token,
    callback,
    query
  );
};
driverRouter.showRouterDetails = function (routerId, token, region, callback, query) {
  return driverRouter.getMethod(
    neutronRemote[region] + '/v2.0/routers/' + routerId,
    token,
    callback,
    query
  );
};

module.exports = driverRouter;
