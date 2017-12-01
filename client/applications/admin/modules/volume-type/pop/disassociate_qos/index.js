const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name || '(' + obj.id.substr(0, 8) + ')';
  config.fields[2].text = obj._qos_specs && (obj._qos_specs.name || '(' + obj._qos_specs.id.substr(0, 8) + ')');

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      request.disconnectQos(obj._qos_specs.id, obj.id).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
