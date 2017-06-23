var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getResourcetypeList: function() {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/resource_types'
    }).then(function(data) {
      return data.resource_types;
    });
  }
};
