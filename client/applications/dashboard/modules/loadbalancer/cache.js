const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getLoadbalancerList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/loadbalancers?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.loadbalancers;
    });
  },
  getListenerList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/listeners?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.listeners;
    });
  }
};
