var fetch = require('client/dashboard/cores/fetch');

module.exports = {
  getSubnetList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/subnets'
    }).then(function(data) {
      return data.subnets;
    });
  }
};
