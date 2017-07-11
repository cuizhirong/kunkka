var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getTemplatelistList: function() {
    return fetch.get({
      url: '/proxy-swift/v1/AUTH_' + HALO.configs.adminProjectId + '/' + HALO.user.projectId + '_template'
    }).then(function(data) {
      return data;
    });
  }
};
