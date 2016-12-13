var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

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

  var props = {
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
