var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
// var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['alarm', 'instance', 'notification'], forced).then(function(data) {
      data.alarm.forEach((alarm) => {
        // name format
        if (alarm.gnocchi_resources_threshold_rule) {
          let rule = alarm.gnocchi_resources_threshold_rule;
          data.instance.some((ins) => {
            if (ins.id === rule.resource_id) {
              rule.resource_name = ins.name ? ins.name : ins.id.substr(0, 8);
              return true;
            }
            return false;
          });
        }

        // state format
        switch (alarm.state) {
          case 'insufficient data':
            alarm.status = 'data_insufficient';
            break;
          case 'ok':
            alarm.status = 'alarm_status_ok';
            break;
          default:
            alarm.status = alarm.state;
            break;
        }

        // time format
        alarm.state_timestamp = alarm.state_timestamp.split('.')[0] + 'Z';

      });

      return data.alarm;
    });
  },
  getResources: function() {
    return storage.getList(['instance']).then(function(data) {
      return data;
    });
  },
  getAlarmHistory: function(id) {
    return fetch.get({
      url: '/proxy/aodh/v2/alarms/' + id + '/history'
    });
  },
  getNofitications: function(forced) {
    return storage.getList(['notification'], forced).then(function(data) {
      let notifications = data.notification.map((ele) => {
        let newEle = ele;
        ele.id = ele.uuid;
        return newEle;
      });

      return notifications;
    });
  },
  getResourceMeasures: function(resourceId, type, granularity, start) {
    return fetch.get({
      url: '/proxy/gnocchi/v1/resource/generic/' + resourceId + '/metric/' + type + '/measures?granularity=' + granularity + '&start=' + start
    }).then(function(data) {
      return data;
    });
  },
  createAlarm: function(data) {
    return fetch.post({
      url: '/proxy/aodh/v2/alarms',
      data: data
    });
  },
  updateAlarm: function(id, data) {
    return fetch.put({
      url: '/proxy/aodh/v2/alarms/' + id,
      data: data
    });
  },
  deleteAlarm: function(id) {
    return fetch.delete({
      url: '/proxy/aodh/v2/alarms/' + id
    });
  }
};
