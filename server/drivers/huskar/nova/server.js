'use strict';

var novaRemote = require('config')('remote').nova;
var Base = require('../base.js');
var driverServer = new Base('server');

driverServer.listServers = function (projectId, token, region, callback, query) { // get servers list.
  return driverServer.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/servers/detail',
    token,
    callback,
    query
  );
};
driverServer.showServerDetails = function (projectId, serverId, token, region, callback, query) { // get single server.
  return driverServer.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/servers/' + serverId,
    token,
    callback,
    query
  );
};

module.exports = driverServer;
