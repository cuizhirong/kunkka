const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    let storgeList = ['floatingip', 'instance', 'network', 'loadbalancer'];
    if (HALO.settings.enable_floatingip_bandwidth) {
      storgeList = storgeList.concat(['fplimit']);
    }
    return storage.getList(storgeList, forced).then(function(data) {

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
      if (HALO.settings.enable_floatingip_bandwidth) {
        data.fplimit.forEach(fp => {
          data.floatingip.some((r, index) => {
            if (fp.floatingip_id === r.id) {
              data.floatingip[index].rate_limit = fp.rate;
            }
          });
        });
      }
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
    let url = '/proxy/gringotts/v2/products/price' +
      '?purchase.bill_method=hour' +
      '&purchase.purchases[0].product_name=ip.floating' +
      '&purchase.purchases[0].service=network' +
      '&purchase.purchases[0].region_id=' + HALO.current_region +
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
      url: '/proxy/neutron/v2.0/uplugin/fipratelimits/' + id,
      data: data
    });
  },
  deleteFloatingIps: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-floating-ips/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createLimit: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/uplugin/fipratelimits',
      data: data
    });
  },
  getLimit: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/uplugin/fipratelimits'
    });
  },
  deleteLimit: function(id) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/uplugin/fipratelimits/' + id
    });
  },
  getLimitById: function(id) {
    return fetch.get({
      url: '/proxy/neutron/v2.0/uplugin/fipratelimits/' + id
    });
  }
};
