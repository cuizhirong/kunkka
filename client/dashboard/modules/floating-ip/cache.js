var request = require('client/dashboard/cores/request');

module.exports = {
  getFloatingipList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/floatingips'
    }).then(function(data) {
      return data.floatingips;
    });
  }
};
