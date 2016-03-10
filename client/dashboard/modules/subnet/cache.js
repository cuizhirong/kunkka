var request = require('client/dashboard/cores/request');

module.exports = {
  getSubnetList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/subnets'
    }).then(function(data) {
      return data.images;
    });
  }
};
