var request = require('client/dashboard/cores/request');

module.exports = {
  getInstanceList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
    }).then(function(data) {
      return data.servers;
    });
  },
  getInstance: function() {

  }
};
