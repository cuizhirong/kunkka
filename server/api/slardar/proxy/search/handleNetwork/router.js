'use strict';
const request = require('superagent');
const routerTypes = ['network:router_interface', 'network:router_interface_distributed', 'network:ha_router_replicated_interface'];
const related = ['subnets', 'ports', 'floatingips'];

const makeNetwork = (router, obj) => {
  router.floatingip = {}; // customized floatingip.
  obj.floatingips.some(function (fip) {
    obj.ports.some(function (port) {
      if (port.id === fip.port_id && port.device_owner === 'network:router_gateway' && port.device_id === router.id) {
        router.floatingip = fip;
        return true;
      }
    });
    // return fip.router_id === router.id && (router.floatingip = fip);
  });
  router.subnets = [];
  obj.ports.forEach(function (port) {
    if (port.device_id === router.id && routerTypes.indexOf(port.device_owner) > -1) {
      obj.subnets.forEach(function (subnet) {
        if (subnet.ip_version === 4 && subnet.id === port.fixed_ips[0].subnet_id) {
          router.subnets.push(subnet);
        }
      });
    }
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
  mainList.forEach(item => makeNetwork(item, relatedData));
};
