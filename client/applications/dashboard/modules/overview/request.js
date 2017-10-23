const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getOverview: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview'
    });
  }
};
