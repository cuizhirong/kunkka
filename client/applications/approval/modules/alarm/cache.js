const fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getAlarmList: function() {
    let userId = HALO.user.userId;
    return fetch.get({
      url: '/proxy/aodh/v2/alarms?q.field=user_id&q.op=eq&q.value=' + userId
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
