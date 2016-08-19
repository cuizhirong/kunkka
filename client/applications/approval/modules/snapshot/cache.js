var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getSnapshotList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/snapshots/detail'
    }).then(function(data) {
      return data.snapshots;
    });
  }
};
