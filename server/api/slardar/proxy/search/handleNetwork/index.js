'use strict';

const handler = {
  network: require('./network'),
  subnet: require('./subnet'),
  router: require('./router')
};


const handleNetwork = function* (mainList, opt) {
  //network: subnet, port, router
  //subnet: network, server, router, port
  //router: subnet, floatingip, server,
  let obj = opt.obj;
  let type = obj.name;

  if (typeof handler[type] === 'function') {
    let token = opt.token;
    let objServer = opt.objServer;
    let endpoint = opt.endpoint;
    let region = opt.region;

    let serverUrl = `${endpoint[objServer.service][region]}/${objServer.version}/${objServer.name}s`;
    let neutronUrl = `${endpoint[obj.service][region]}/${obj.version}/`;
    yield handler[type](mainList, token, neutronUrl, serverUrl);
  }
};

module.exports = handleNetwork;
