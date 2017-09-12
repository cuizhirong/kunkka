const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['subnet', 'network', 'router', 'instance', 'port'], forced).then(function(data) {
      let subnets = data.subnet;
      subnets.forEach((subnet) => {
        subnet.port_security_enabled = subnet.network.port_security_enabled;
        subnet.ports.forEach((item) => {
          if (item.device_owner === 'network:ha_router_replicated_interface') {
            data.router.some((r) => {
              if (r.id === item.device_id) {
                item.router = r;
                return true;
              }
              return false;
            });
          }
          if (item.device_owner.indexOf('compute') > -1) {
            data.instance.some((i) => {
              if (i.id === item.device_id) {
                item.server = i;
                return true;
              }
              return false;
            });
            if (!item.server) {
              item.server = {
                id: item.device_id,
                status: 'SOFT_DELETED'
              };
            }
          }
          if (item.device_owner) {
            item.status = 'ACTIVE';
          }
        });
      });

      let exNetworks = data.network.filter(n => {
        if(n['router:external'] === true) {
          return true;
        }
        return false;
      });

      return subnets.filter(s => {
        let isExSubnet = false;
        exNetworks.forEach(n => {
          if(s.network_id === n.id) {
            isExSubnet = isExSubnet || true;
          }
        });
        if(isExSubnet && s.tenant_id !== HALO.user.projectId) {
          return false;
        }
        return true;
      });
    });
  },
  editSubnetName: function(item, newName) {
    let data = {};
    data.subnet = {};
    data.subnet.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/subnets/' + item.id,
      data: data
    });
  },
  deleteSubnets: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/subnets/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createSubnet: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/subnets',
      data: {
        subnet: data
      }
    });
  },
  updateSubnet: function(subnetId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/subnets/' + subnetId,
      data: {
        subnet: data
      }
    });
  },
  connectRouter: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/add_router_interface',
      data: data
    });
  },
  disconnectRouter: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/remove_router_interface',
      data: data
    });
  },
  addInstance: function(serverId, networkId) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-interface',
      data: networkId
    });
  },
  getNetworks: function() {
    return storage.getList(['network']).then(function(data) {
      return data.network.filter((n) => {
        if (n['router:external']) {
          return false;
        }
        return true;
      });
    });
  },
  getInstances: function() {
    return storage.getList(['instance']).then(function(data) {
      return data.instance;
    });
  },
  getRouters: function() {
    return storage.getList(['router']).then(function(data) {
      return data.router;
    });
  },
  deletePort: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/ports/' + item.id
    });
  },
  createPort: function(port) {
    let data = {
      port: port
    };
    return fetch.post({
      url: '/proxy/neutron/v2.0/ports',
      data: data
    });
  }
};
