var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getVolumeList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/volumes/detail'
    }).then(function(data) {
      return data.volumes;
    });
  }
};
