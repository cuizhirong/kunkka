var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['alarm', 'instance', 'volume', 'notification', 'port'], forced).then(function(data) {
      data.alarm.forEach((alarm) => {
        // name format
        if (alarm.gnocchi_resources_threshold_rule) {
          let rule = alarm.gnocchi_resources_threshold_rule;

          switch(rule.resource_type) {
            case 'instance':
              data.instance.some((ins) => {
                if (ins.id === rule.resource_id) {
                  rule.resource_name = ins.name ? ins.name : ins.id.substr(0, 8);
                  return true;
                }
                return false;
              });
              break;
            case 'volume':
              data.volume.some((vol) => {
                if (vol.id === rule.resource_id) {
                  rule.resource_name = vol.name ? vol.name : vol.id.substr(0, 8);
                  return true;
                }
                return false;
              });
              break;
            case 'instance_network_interface':
              break;
            default:
              break;
          }
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
        alarm.timestamp = alarm.timestamp.split('.')[0] + 'Z';

      });

      return data.alarm;
    });
  },
  getResources: function() {
    return storage.getList(['instance', 'volume']);
  },
  getInstance: function() {
    return storage.getList(['instance']);
  },
  getVolume: function() {
    return storage.getList(['volume']);
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
  getVolumeMeasures: function(volResourceId, granularity, start) {
    return fetch.get({
      url: '/proxy/gnocchi/v1/metric/' + volResourceId + '/measures?granularity=' + granularity + '&start=' + start
    });
  },
  getNetworkResources: function(instanceId) {
    let data = {
      '=': {
        instance_id: instanceId
      }
    };
    return fetch.post({
      url: '/proxy/gnocchi/v1/search/resource/instance_network_interface',
      data: data
    });
  },
  getVolumeResourceId: function(volumeId) {
    let data = {
      '=': {
        original_resource_id: volumeId
      }
    };
    return fetch.post({
      url: '/proxy/gnocchi/v1/search/resource/instance_disk',
      data: data
    });
  },
  getOriginalMeasureId: function(resourceId) {
    return fetch.get({
      url: '/proxy/gnocchi/v1/resource/generic/' + resourceId
    });
  },
  getPorts: function(forced) {
    return storage.getList(['port'], forced).then(function(data) {
      return data.port;
    });
  },
  getOriginalPort: function(resourceId) {
    let list = [];
    list.push(this.getPorts());
    list.push(this.getOriginalMeasureId(resourceId));

    return RSVP.all(list);
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
