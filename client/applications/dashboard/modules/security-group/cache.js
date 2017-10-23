const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getSecuritygroupList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/security?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.security_groups;
    });
  }
};
