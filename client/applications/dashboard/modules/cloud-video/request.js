const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getRedirectUrl: function() {
    return fetch.get({
      url: '/api/video/redirect'
    });
  }
};
