var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getSubnetList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/subnets?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.subnets;
    });
  }
};
