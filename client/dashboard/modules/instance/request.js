var request = require('client/dashboard/cores/request');

module.exports = {
  listInstances: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
    });
  }

};
