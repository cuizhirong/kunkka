var request = require('client/dashboard/cores/request');

module.exports = {
  getPortList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/nic'
    }).then(function(data) {
      return data.nics;
    });
  },
  getInstance: function() {

  }
};
