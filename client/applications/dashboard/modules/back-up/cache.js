const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getBackupList: function() {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/backups/detail'
    }).then(function(data) {
      return data.backups;
    });
  }
};
