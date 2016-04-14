'use strict';

var neutronRemote = require('config')('remote').neutron;
var Base = require('../base.js');
var driverNetwork = new Base('network');

driverNetwork.listNetworks = function (token, region, callback, query) {
  return driverNetwork.getMethod(
    neutronRemote[region] + '/v2.0/networks',
    token,
    callback,
    query
  );
};
driverNetwork.showNetworkDetails = function (networkId, token, region, callback, query) {
  return driverNetwork.getMethod(
    neutronRemote[region] + '/v2.0/networks/' + networkId,
    token,
    callback,
    query
  );
};

module.exports = driverNetwork;
