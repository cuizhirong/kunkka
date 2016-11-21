var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getAlarmList: function() {
    return fetch.get({
      url: '/proxy/aodh/v2/alarms'
    }).then(function(data) {
      return data;
    });
  },
  getNotificationList: function() {
    return fetch.get({
      url: '/proxy/kiki/v1/topics'
    }).then(function(data) {
      return data.topics;
    });
  }
};
