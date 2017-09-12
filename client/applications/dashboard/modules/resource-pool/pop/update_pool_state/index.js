const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, enableTrue, callback) {
  if(enableTrue) {
    config.title = ['enable', 'pool'];
    config.btn.value = 'enable';
    config.fields[0].info = __[config.fields[0].field].replace('{0}', __.enable);
  } else {
    config.title = ['disable', 'pool'];
    config.btn.value = 'disable';
    config.fields[0].info = __[config.fields[0].field].replace('{0}', __.disable);
  }
  config.fields[0].info = config.fields[0].info.replace('{1}', obj.name || '(' + obj.id.slice(0, 8) + ')');
  config.btn.disabled = false;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let poolParam = {'admin_state_up': enableTrue};
      request.updatePool(obj.id, poolParam).then(res => {
        callback && callback();
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
