'use strict';
const request = require('superagent');
const routerTypes = ['network:router_interface', 'network:router_interface_distributed', 'network:ha_router_replicated_interface'];
const related = ['subnets', 'ports', 'routers'];

const makeNetwork = (network, obj) => {
  network.subnets.forEach(function (subnet, index) {
    obj.subnets.some(function (sub) {
      if (sub.id === subnet) {
        network.subnets[index] = sub;
        obj.ports.forEach(function (port) {
          if (port.network_id === network.id && routerTypes.indexOf(port.device_owner) > -1) {
            port.fixed_ips.some(function (s) {
              if (s.subnet_id === subnet) {
                obj.routers.some(function (router) {
                  if (router.id === port.device_id) {
                    sub.router = router;
                    return true;
                  }
                });
                return true;
              }
            });
          }
        });
        return true;
      }
    });
  });
};

module.exports = function* (mainList, token, neutronUrl) {
  //get related data
  let relatedData = {};
  related.forEach(key => {
    relatedData[key] = request.get(neutronUrl + key).set('X-Auth-Token', token);
  });
  relatedData = yield relatedData;
  related.forEach(key => {
    relatedData[key] = relatedData[key].body[key];
  });

  //make main list
  mainList.forEach(item => makeNetwork(item, relatedData));
};
