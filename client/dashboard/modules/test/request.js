var request = require('client/dashboard/cores/request');

module.exports = {
  listInstances: function(cb) {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
    }).then(function(data) {
      cb(data);
    });
  }

};
