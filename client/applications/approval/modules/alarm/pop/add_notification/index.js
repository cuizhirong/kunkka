const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/approval.lang.json');
const getErrorMessage = require('client/applications/approval/utils/error_message');
const utils = require('../../utils');

function pop(obj, callback) {

  let props = {
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
      let type = refs.trigger.state.value;
      let id = refs.notification_list.state.value;
      let actions = alarm[type + '_actions'];
      let hasNotify = actions.some((url, i) => utils.getNotificationIdByUrl(url) === id);

      if (hasNotify) {
        cb && cb(true);
      } else {
        actions.push(HALO.configs.kiki_url + '/v1/topics/' + id + '/alarm');
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
