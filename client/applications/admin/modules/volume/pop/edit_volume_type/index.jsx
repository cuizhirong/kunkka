const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const { Notification } = require('client/uskin/index');

function pop(types, rows) {
  let defaultValue = 0;
  types.shift();
  types.forEach((i, index) => {
    i.disabled = false;
    i.id = index;
    defaultValue = i.name === rows[0].volume_type ? index : defaultValue;
  });
  config.fields && config.fields.forEach(item => {
    if (item.field === 'volume-type') {
      item.data = types;
      item.value = defaultValue;
    }
  });
  let props = {
    __: __,
    config: config,
    onConfirm: function(refs, cb) {
      if (defaultValue === refs['volume-type'].state.value || refs['volume-type'].state.value === '') {
        cb(true);
        Notification.addNotice({
          showIcon: true,
          content: __.modify_fail,
          isAutoHide: true,
          type: 'danger',
          width: 200,
          id: Date.now()
        });
        return;
      }
      let selectedType = types[refs['volume-type'].state.value].name;
      request.retypeVolume(selectedType, 'on-demand', rows).then((res) => {
        Notification.addNotice({
          showIcon: true,
          content: __.modify_success,
          isAutoHide: true,
          type: 'success',
          width: 200,
          id: Date.now()
        });
        cb(true);
      }).catch(res => {
        Notification.addNotice({
          showIcon: true,
          content: __.modify_fail,
          isAutoHide: true,
          type: 'danger',
          width: 200,
          id: Date.now()
        });
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
