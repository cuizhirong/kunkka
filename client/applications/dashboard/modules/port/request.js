const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['port', 'instance', 'subnet', 'securitygroup', 'router'], forced).then((data) => {
      data.port.forEach((item) => {
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
        if (!item.device_owner) {
          item.status = 'DOWN';
        } else {
          item.status = 'ACTIVE';
        }
      });
      return data.port;
    });
  },
  getSecuritygroupList: function(forced) {
    return storage.getList(['securitygroup'], forced);
  },
  getInstanceList: function(forced) {
    return storage.getList(['instance'], forced);
  },
  getNetworkList: function(forced) {
    return storage.getList(['network'], forced);
  },
  getSubnetList: function(forced) {
    return storage.getList(['subnet'], forced);
  },
  getSubnetSGList: function(forced) {
    return storage.getList(['subnet', 'securitygroup'], forced);
  },
  editPortName: function(item, newName) {
    let data = {};
    data.port = {};
    data.port.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/ports/' + item.id,
      data: data
    });
  },
  deletePorts: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/ports/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createPort: function(port) {
    let data = {
      port: port
    };
    return fetch.post({
      url: '/proxy/neutron/v2.0/ports',
      data: data
    });
  },
  editSecurityGroup: function(data, id) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/ports/' + id,
      data: data
    });
  },
  attachInstance: function(serverId, portId) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-interface',
      data: {
        interfaceAttachment: {
          port_id: portId
        }
      }
    });
  },
  detchInstance: function(serverId, portId) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-interface/' + portId
    });
  }
};
