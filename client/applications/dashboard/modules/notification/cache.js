var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getNotificationList: function() {
    return fetch.get({
      url: '/proxy/kiki/v1/topics'
    }).then(function(data) {
      return data.topics;
    });
  }
};
