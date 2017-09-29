const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getTemplatelistList: function() {
    return fetch.get({
      url: `${HALO.configs.swift_url}/${HALO.user.projectId}_template`
    }).then(function(data) {
      return data;
    });
  }
};
