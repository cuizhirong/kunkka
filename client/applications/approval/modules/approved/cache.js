var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getApprovedList: function() {
    return fetch.get({
      url: '/api/apply/approved'
    }).then(function(data) {
      return data.Applies;
    });
  }
};
