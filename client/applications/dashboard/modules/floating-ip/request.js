var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['floatingip', 'instance', 'network'], forced).then(function(data) {
      data.floatingip.forEach((f) => {
        if (f.association.type) {
          f.status = 'active';
        }
      });
      return data.floatingip;
    });
  },
  getNetworks: function() {
    return storage.getList(['network']).then(function(data) {
      return data.network;
    });
  },
  getInstances: function() {
    return storage.getList(['instance']).then(function(data) {
      return data.instance;
    });
  },
  createFloatingIp: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/floatingips',
      data: data
    });
  },
  associateInstance: function(item, portId) {
    var data = {};
    data.floatingip = {};
    data.floatingip.port_id = portId;

    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + item.id,
      data: data
    });
  },
  dissociateInstance: function(item) {
    var data = {};
    data.floatingip = {};
    data.floatingip.port_id = null;

    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + item.id,
      data: data
    });
  },
  changeBandwidth: function(id, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + id + '/update_floatingip_ratelimit',
      data: data
    });
  },
  deleteFloatingIps: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-floating-ips/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  }
};
