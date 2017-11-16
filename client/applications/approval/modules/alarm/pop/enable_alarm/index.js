const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/approval.lang.json');
const getErrorMessage = require('client/applications/approval/utils/error_message');

function pop(obj, enabled, callback) {

  let tips = config.fields[0];
  tips.info = __.confirm_enable_alram.replace('{0}', obj.name);

  if (enabled) {
    config.title = ['enable', 'alarm'];
    tips.info = tips.info.replace('{1}', __.alarm_enabled);
  } else {
    config.title = ['disable', 'alarm'];
    tips.info = tips.info.replace('{1}', __.alarm_disabled);
  }

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let newAlarm = Object.assign({}, obj);
      newAlarm.enabled = enabled;

      request.updateAlarm(newAlarm.alarm_id, newAlarm).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
