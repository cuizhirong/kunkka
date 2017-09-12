const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, callback) {

  let text = config.fields[0];
  let volumeName = obj.volume.name ? obj.volume.name : '(' + obj.volume.id.substr(0, 8) + ')';
  text.info = __.cancel_transfer_text.replace('{0}', volumeName);

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      let transferId = obj.transfer.id;

      request.deleteTransfer(transferId).then((res) => {
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
