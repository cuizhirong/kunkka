var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['pools'], forced).then(function(data) {
      return data.pools;
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
  getListeners: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/listeners?tenant_id=' + HALO.user.projectId
    });
  }
};
