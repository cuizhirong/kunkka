var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var utils = require('../../utils');

function pop(obj, callback) {

  var props = {
    __: __,
    config: config,
    onInitialize: function(refs) {
      let triggers = [{
        name: __.alarm_when_alarm,
        id: 'alarm'
      }, {
        name: __.alarm_when_ok,
        id: 'ok'
      }, {
        name: __.alarm_when_data_insufficient,
        id: 'insufficient_data'
      }];

      request.getNofitications().then((notifications) => {
        refs.trigger.setState({
          data: triggers,
          value: triggers[0].id
        });

        if (notifications.length > 0) {
          refs.notification_list.setState({
            data: notifications,
            value: notifications[0].id
          });
        } else {
          refs.btn.setState({
            disabled: true
          });
        }
      });

    },
    onConfirm: function(refs, cb) {

      let alarm = Object.assign({}, obj);
      delete alarm.status;
      delete alarm.gnocchi_resources_threshold_rule.resource_name;
      let type = refs.trigger.state.value;
      let name = refs.notification_list.state.value;
      let actions = alarm[type + '_actions'];
      let hasNotify = actions.some((url, i) => utils.getNotificationIdByUrl(url) === name);

      if (hasNotify) {
        cb && cb(true);
      } else {
        actions.push('zaqar://?queue_name=' + name + '&project_id=' + HALO.user.projectId + '&paths=/messages&methods=POST&expires=' + utils.getISOTime(1));
        request.updateAlarm(alarm.alarm_id, alarm).then((res) => {
          callback && callback(res);
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
