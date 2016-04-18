'use strict';

var novaRemote = require('config')('remote').nova;
var Base = require('../base.js');
var driverFlavor = new Base('flavor');

driverFlavor.listFlavors = function (projectId, token, region, callback, query) {
  return driverFlavor.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/flavors/detail',
    token,
    callback,
    query
  );
};
driverFlavor.showFlavorDetails = function (projectId, flavorId, token, region, callback, query) {
  return driverFlavor.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/flavors/' + flavorId,
    token,
    callback,
    query
  );
};
module.exports = driverFlavor;
