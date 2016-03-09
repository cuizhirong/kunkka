var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb) {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/nic'
    }).then(function(data) {
      cb(data);
    });
  }
};
