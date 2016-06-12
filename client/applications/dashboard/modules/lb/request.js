var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['lbaas'], forced).then(function(data) {
      return data.lbaas;
    });
  },
  createLb: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/lbaas/loadbalancers',
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
  }
};
