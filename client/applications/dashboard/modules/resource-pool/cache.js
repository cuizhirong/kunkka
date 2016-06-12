var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getPoolsList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/pools?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.pools;
    });
  }
};
