var request = require('client/dashboard/cores/request');

module.exports = {
  listVolumes: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/volumes/detail'
    });
  }

};
