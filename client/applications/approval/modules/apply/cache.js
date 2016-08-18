var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getApplyList: function() {
    return fetch.get({
      url: '/api/apply/my-apply'
    }).then(function(data) {
      return data.Applies;
    });
  }
};
