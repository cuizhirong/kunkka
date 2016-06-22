var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['pool', 'healthmonitor', 'loadbalancer', 'listener'], forced).then(function(data) {
      data.pool.forEach(pool => {
        if(pool.healthmonitor_id) {
          data.healthmonitor.some(hm => {
            if(hm.id === pool.healthmonitor_id) {
              pool.healthmonitor = hm;
              return true;
            }
            return false;
          });
        }
        var lbs = data.loadbalancer,
          listeners = data.listener;
        lbs.some(lb => {
          lb.listeners.some(listener => {
            if(listener.id === pool.listeners[0].id) {
              pool.loadbalancer = lb;
            }
          });
        });
        listeners.some(l => {
          if(l.id === pool.listeners[0].id) {
            pool.listener = l;
          }
        });
      });
      return data.pool;
    });
  },
  createPool: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/lbaas/pools',
      data: {'pool': data}
    });
  },
  deletePools: function(items) {
    var deferredList = [];
    items.forEach(item => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/lbaas/pools/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getListeners: function(forced) {
    return storage.getList(['listener'], forced).then(data => {
      return data.listener;
    });
  },
  getRelated: function(forced) {
    return storage.getList(['instance', 'port'], forced).then(data => {
      return data;
    });
  },
  editPoolName: function(rawItem, newName) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/pools/' + rawItem.id,
      data: {'pool': {'name': newName}}
    });
  },
  updatePool: function(poolID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/pools/' + poolID,
      data: {'pool': data}
    });
  },
  addMember: function(poolID, data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/lbaas/pools/' + poolID + '/members',
      data: {'member': data}
    });
  },
  getMembers: function(poolID) {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/pools/' + poolID + '/members'
    });
  },
  deleteMember: function(poolID, memberID) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/lbaas/pools/' + poolID + '/members/' + memberID
    });
  },
  updateMember: function(poolID, memberID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/pools/' + poolID + '/members/' + memberID,
      data: {'member': data}
    });
  },
  createMonitor: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/lbaas/healthmonitors',
      data: {'healthmonitor': data}
    });
  },
  updateMonitor: function(monitorID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/lbaas/healthmonitors/' + monitorID,
      data: {'healthmonitor': data}
    });
  },
  deleteMonitor: function(monitor) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/lbaas/healthmonitors/' + monitor.id
    });
  }
};
