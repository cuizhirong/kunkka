var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getApplyList: function() {
    return fetch.get({
      url: '/api/apply/my-apply'
    }).then(function(data) {
      return data.Applies;
    });
  }
};
