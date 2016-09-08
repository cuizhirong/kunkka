'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listServers = function (projectId, token, remote, callback, query) { // get servers list.
  return driver.getMethod(
    remote + '/v2.1/' + projectId + '/servers/detail',
    token,
    callback,
    query
  );
};
driver.showServerDetails = function (projectId, serverId, token, remote, callback, query) { // get single server.
  return driver.getMethod(
    remote + '/v2.1/' + projectId + '/servers/' + serverId,
    token,
    callback,
    query
  );
};

driver.getVNCConsole = function (projectId, serverId, token, remote, callback, theBody) {
  return driver.postMethod(
    remote + '/v2.1/' + projectId + '/servers/' + serverId + '/action',
    token,
    callback,
    theBody
  );
};

driver.resizeServer = function (projectId, serverId, flavor, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.1/' + projectId + '/servers/' + serverId + '/action',
    token,
    callback,
    {
      resize: {
        flavorRef: flavor
      }
    }
  );
};

driver.createSnapshot = function (projectId, serverId, name, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.1/' + projectId + '/servers/' + serverId + '/action',
    token,
    callback,
    {
      createImage: {
        metadata:{
          meta_val: 'meta_val'
        },
        name: name
      }
    }
  );
};

module.exports = driver;
