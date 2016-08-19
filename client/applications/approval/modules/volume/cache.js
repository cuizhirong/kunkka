var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getVolumeList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/volumes/detail'
    }).then(function(data) {
      return data.volumes;
    });
  }
};
