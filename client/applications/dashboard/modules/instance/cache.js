var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getInstanceList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
    }).then(function(data) {
      return data.servers;
    });
  },
  getFlavorList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/flavors/detail'
    }).then(function(data) {
      return data.flavors;
    });
  }
};
