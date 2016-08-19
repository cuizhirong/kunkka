var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getPortList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/ports?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.ports;
    });
  }
};
