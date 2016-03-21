var fetch = require('client/dashboard/cores/fetch');

module.exports = {
  getInstanceList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
    }).then(function(data) {
      return data.servers;
    });
  }
};
