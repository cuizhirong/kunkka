var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['floatingip', 'instance', 'network', 'loadbalancer'], forced).then(function(data) {
      data.floatingip.forEach((f) => {
        data.network.some(n => {
          if(n.id === f.floating_network_id) {
            f.floating_network_name = n.name;
            return true;
          }
          return false;
        });
        data.loadbalancer.some(lb => {
          if(lb.vip_address === f.fixed_ip_address) {
            f.lbaas = {};
            f.lbaas.name = lb.name;
            f.lbaas.id = lb.id;
            return true;
          }
          return false;
        });
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
  getFloatingIPPrice: function(bandwidth) {
    var url = '/proxy/gringotts/v2/products/price' +
      '?purchase.bill_method=hour' +
      '&purchase.purchases[0].product_name=ip.floating' +
      '&purchase.purchases[0].service=network' +
      '&purchase.purchases[0].region_id=RegionOne' +
      '&purchase.purchases[0].quantity=' + bandwidth;

    return fetch.get({
      url: url
    });
  },
  createFloatingIp: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/floatingips',
      data: data
    });
  },
  associateInstance: function(serverID, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverID + '/action',
      data: data
    });
  },
  dissociateResource: function(fipID) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + fipID,
      data: {'floatingip': {
        'port_id': null
      }}
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
