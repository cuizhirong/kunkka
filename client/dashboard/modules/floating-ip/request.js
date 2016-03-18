var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');
var RSVP = require('rsvp');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['floatingip', 'instance', 'network'], forced).then(function(data) {
      cb(data.floatingip);
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
  createFloatingIp: function(data) {
    return request.post({
      url: '/proxy/neutron/v2.0/floatingips',
      data: data
    });
  },
  associateInstance: function(item, portId) {
    var data = {};
    data.floatingip = {};
    data.floatingip.port_id = portId;

    return request.put({
      url: '/proxy/neutron/v2.0/floatingips/' + item.id,
      data: data
    });
  },
  dissociateInstance: function(item) {
    var data = {};
    data.floatingip = {};
    data.floatingip.port_id = null;

    return request.put({
      url: '/proxy/neutron/v2.0/floatingips/' + item.id,
      data: data
    });
  },
  deleteFloatingIps: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(request.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-floating-ips/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  }
};
