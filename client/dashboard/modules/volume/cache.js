var request = require('client/dashboard/cores/request');

module.exports = {
  getVolumeList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/volumes/detail'
    }).then(function(data) {
      return data.images;
    });
  }
};
