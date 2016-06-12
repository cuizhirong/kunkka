var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getLbaasList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/lbaas/loadbalancers?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.loadbalancers;
    });
  }
};
