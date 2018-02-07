'use strict';

const qs = require('querystring');

const Base = require('../base.js');
const driver = new Base();


driver.listServers = function (projectId, token, remote, callback, query) { // get servers list.
  return driver.getMethod(
    remote + '/v2.1/' + projectId + '/servers/detail',
    token,
    callback,
    query
  );
};
// because api return max number of items in a single response
// need recursive retrieve all items
driver.listServersRecursive = function (link, servers, obj, callback) { // get servers list.
  const nextLinkHref = link[0].href;
  const linkUrlQuery = nextLinkHref.split('?')[1];
  const marker = qs.parse(linkUrlQuery).marker || '';
  obj.query.marker = marker;
  driver.listServers(obj.projectId, obj.token, obj.remote, (err, payload) => {
    if (err) {
      callback(err);
    } else {
      const result = payload.body;
      servers = servers.concat(result.servers);
      if (result.servers_links) {
        driver.listServersRecursive(result.servers_links, servers, obj, callback);
      } else {
        callback(null, {servers});
      }
    }
  }, obj.query);
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

driver.createSnapshot = function (projectId, serverId, name, metadata, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.1/' + projectId + '/servers/' + serverId + '/action',
    token,
    callback,
    {
      createImage: {
        metadata: metadata,
        name: name
      }
    }
  );
};

/*** Promise ***/
driver.listServersAsync = function (projectId, token, remote, query) { // get servers list.
  return driver.getMethodAsync(
    remote + '/v2.1/' + projectId + '/servers/detail',
    token,
    query
  );
};
driver.showServerDetailsAsync = function (projectId, serverId, token, remote, query) { // get single server.
  return driver.getMethodAsync(
    remote + '/v2.1/' + projectId + '/servers/' + serverId,
    token,
    query
  );
};

driver.getVNCConsoleAsync = function (projectId, serverId, token, remote, theBody) {
  return driver.postMethodAsync(
    remote + '/v2.1/' + projectId + '/servers/' + serverId + '/action',
    token,
    theBody
  );
};

driver.resizeServerAsync = function (projectId, serverId, flavor, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.1/' + projectId + '/servers/' + serverId + '/action',
    token,
    {
      resize: {
        flavorRef: flavor
      }
    }
  );
};

driver.createSnapshotAsync = function (projectId, serverId, name, metadata, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.1/' + projectId + '/servers/' + serverId + '/action',
    token,
    {
      createImage: {
        metadata: metadata,
        name: name
      }
    }
  );
};

module.exports = driver;
