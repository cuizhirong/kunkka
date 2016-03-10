var request = require('client/dashboard/cores/request');

module.exports = {
  getSnapshotList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/snapshots/detail'
    }).then(function(data) {
      return data.images;
    });
  }
};
