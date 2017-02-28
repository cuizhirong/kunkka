var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getAlarmList: function() {
    return fetch.get({
      url: '/proxy/aodh/v2/alarms?q.field=user_id&q.op=eq&q.value=fc56c4e01a1844ab8f508c5191553f69'
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
