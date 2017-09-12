const fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getNetworkList: function() {
    return fetch.get({
      url: '/api/v1/networks?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.networks;
    });
  }
};
