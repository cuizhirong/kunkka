var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');
var RSVP = require('rsvp');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['subnet', 'network', 'router', 'instance'], forced).then(function(data) {
      cb(data.subnet);
    });
  },
  editSubnetName: function(item, newName) {
    var data = {};
    data.subnet = {};
    data.subnet.name = newName;

    return request.put({
      url: '/proxy/neutron/v2.0/subnets/' + item.id,
      data: data
    });
  },
  deleteSubnets: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(request.delete({
        url: '/proxy/neutron/v2.0/subnets/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createSubnet: function(data) {
    return request.post({
      url: '/proxy/neutron/v2.0/subnets',
      data: {
        subnet: data
      }
    });
  },
  updateSubnet: function(subnetId, data) {
    return request.put({
      url: '/proxy/neutron/v2.0/subnets/' + subnetId,
      data: {
        subnet: data
      }
    });
  },
  connectRouter: function(routerId, data) {
    return request.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/add_router_interface',
      data: data
    });
  },
  disconnectRouter: function(routerId, data) {
    return request.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/remove_router_interface',
      data: data
    });
  },
  addInstance: function(serverId, subnetId, networkId) {
    return request.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + 'servers/' + serverId + '/os-interface',
      data: {
        interfaceAttachment: {
          fixed_ips: [{
            subnet_id: subnetId
          }],
          net_id: networkId
        }
      }
    });
  },
  getNetworks: function(cb) {
    return storage.getList(['network']).then(function(data) {
      cb(data.network);
    });
  },
  getInstances: function(cb) {
    return storage.getList(['instance']).then(function(data) {
      cb(data.instance);
    });
  },
  getRouters: function(cb) {
    return storage.getList(['router']).then(function(data) {
      cb(data.router);
    });
  }
};
