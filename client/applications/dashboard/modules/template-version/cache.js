const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getTemplateversionList: function() {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/template_versions'
    }).then(function(data) {
      return data.template_versions;
    });
  }
};
