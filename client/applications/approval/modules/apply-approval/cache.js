var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getApprovingList: function() {
    return fetch.get({
      url: '/api/apply/approving'
    }).then(function(data) {
      return data.Applies;
    });
  }
};
