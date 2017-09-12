const fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getRouterList: function() {
    return fetch.get({
      url: '/api/v1/routers?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.routers;
    });
  }
};
