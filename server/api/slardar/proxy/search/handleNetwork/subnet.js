'use strict';
const request = require('superagent');
const routerTypes = ['network:router_interface', 'network:router_interface_distributed', 'network:ha_router_replicated_interface'];
const related = ['networks', 'ports', 'routers'];
//subnet: network, server, router, port

const make = (subnet, obj) => {
  obj.networks.some(function (n) {
    return subnet.network_id === n.id && (subnet.network = n);
  });
  subnet.ports = [];
  subnet.router = {};
  obj.ports.forEach(function (p) {
    p.fixed_ips.some(function (ip) {
      if (ip.subnet_id === subnet.id) {
        if (p.device_owner === 'compute:nova' || p.device_owner === 'compute:None') {
          if (obj.servers) {
            obj.servers.some(function(server) {
              return server.id === p.device_id && (p.server = server);
            });
          }
        } else if (routerTypes.indexOf(p.device_owner) > -1) {
          obj.routers.some(function (r) {
            return r.id === p.device_id && (subnet.router = r);
          });
        }
        subnet.ports.push(p);
        return true;
      }
    });
  });
};

module.exports = function* (mainList, token, neutronUrl, serverUrl) {
  //get related data
  let relatedData = {};
  related.forEach(key => {
    relatedData[key] = request.get(neutronUrl + key).set('X-Auth-Token', token);
  });
  relatedData.servers = request.get(serverUrl).set('X-Auth-Token', token);
  relatedData = yield relatedData;
  related.concat('servers').forEach(key => {
    relatedData[key] = relatedData[key].body[key];
  });

  //make main list
  mainList.forEach(item => make(item, relatedData));
};
