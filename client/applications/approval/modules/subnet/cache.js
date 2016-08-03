var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getSubnetList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/subnets?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.subnets;
    });
  }
};
