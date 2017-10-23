const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getTemplatelistList: function() {
    return fetch.get({
      url: '/proxy-swift/' + HALO.user.projectId + '_template?format=json'
    }).then(function(data) {
      return data;
    });
  }
};
