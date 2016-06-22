var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['loadbalancer', 'floatingip', 'subnet'], forced).then(function(data) {
      data.loadbalancer.forEach(lb => {
        data.floatingip.some(fip => {
          if(lb.vip_port_id === fip.port_id) {
            lb.floatingip = fip;
            return true;
          }
          return false;
        });
        data.subnet.some(s => {
          if(lb.vip_subnet_id === s.id) {
            lb.subnet = s.name;
            return true;
          }
          return false;
        });
      });
      return data.loadbalancer;
    });
  },
  createLb: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/lbaas/loadbalancers',
      data: {'loadbalancer': data}
    });
  },
  updateLb: function(lbID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/loadbalancers/' + lbID,
      data: {'loadbalancer': data}
    });
  },
  deleteLb: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/lbaas/loadbalancers/' + item.id
    });
  },
  createListener: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/lbaas/listeners',
      data: {'listener': data}
    });
  },
  editLbaasName: function(rawItem, newName) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/loadbalancers/' + rawItem.id,
      data: {'loadbalancer': {'name': newName}}
    });
  },
  getRelatedListeners: function(data) {
    var deferredList = [];
    data.forEach(item => {
      deferredList.push(fetch.get({
        url: '/proxy/neutron/v2.0/lbaas/listeners/' + item.id
      }).then(res => {
        return res.listener;
      }));
    });
    return RSVP.all(deferredList);
  },
  associatePool: function(listenerID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/listeners/' + listenerID,
      data: {'listener': data}
    });
  },
  deleteListener: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/lbaas/listeners/' + item.id
    });
  },
  updateListener: function(listenerID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/listeners/' + listenerID,
      data: {'listener': data}
    });
  },
  getFloatingIpList: function() {
    return storage.getList(['floatingip']).then(function(data) {
      return data.floatingip;
    });
  },
  associateFloatingIp: function(portID, fipID) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + fipID,
      data: {'floatingip': {'port_id': portID}}
    });
  }
};
