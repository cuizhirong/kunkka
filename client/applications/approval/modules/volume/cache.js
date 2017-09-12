const fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getVolumeList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/volumes/detail/owner'
    }).then(function(data) {
      return data.volumes;
    });
  }
};
