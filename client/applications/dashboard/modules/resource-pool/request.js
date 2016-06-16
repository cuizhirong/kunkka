var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['pool'], forced).then(function(data) {
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
  }
};
