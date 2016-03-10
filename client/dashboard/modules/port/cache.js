var request = require('client/dashboard/cores/request');

module.exports = {
  getPortList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/ports'
    }).then(function(data) {
      return data.ports;
    });
  }
};
