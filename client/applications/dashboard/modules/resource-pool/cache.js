const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getPoolList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/pools?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.pools;
    });
  },
  getHealthmonitorList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/healthmonitors'
    }).then(function(data) {
      return data.healthmonitors;
    });
  },
  getMemberList: function() {
    //fake cache request to pass ws update
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/pools?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.pools;
    });
  }
};
