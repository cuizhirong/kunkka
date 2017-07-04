var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, callback) {

  var props = {
    __: __,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      if (!refs.transfer_name.state.hide) {
        let data = {
          transfer: {
            volume_id: obj.id,
            name: refs.transfer_name.state.value
          }
        };

        request.createTransfer(data).then((res) => {
          refs.transfer_name.setState({
            hide: true
          });

          refs.auth_key.setState({
            value: res.transfer.auth_key,
            hide: false
          });

          refs.transfer_id.setState({
            value: res.transfer.id,
            hide: false
          });

          refs.create_transfer_tip.setState({
            hide: false
          });

          cb(false);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      } else {
        callback && callback();
        cb(true);
      }
    },
    onAction: function(field, state, refs){
      switch (field) {
        case 'transfer_name':
          refs.btn.setState({
            disabled: !state.value
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);

}

module.exports = pop;
