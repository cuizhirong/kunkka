const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getAlarmList: function() {
    return fetch.get({
      url: '/proxy/aodh/v2/alarms'
    }).then(function(data) {
      return data;
    });
  }
};
