var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getOrchestrationList: function() {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/stacks'
    }).then(function(data) {
      return data.stacks;
    });
  }
};
