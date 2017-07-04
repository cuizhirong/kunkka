var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, callback) {

  var text = config.fields[0];
  var volumeName = obj.volume.name ? obj.volume.name : '(' + obj.volume.id.substr(0, 8) + ')';
  text.info = __.cancel_transfer_text.replace('{0}', volumeName);

  var props = {
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
