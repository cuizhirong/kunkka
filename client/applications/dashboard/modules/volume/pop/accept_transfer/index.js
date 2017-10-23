const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, callback) {

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let authKey = refs.auth_key.state.value;
      let transferId = refs.transfer_id.state.value;

      let data = {
        accept: {
          auth_key: authKey
        }
      };

      request.acceptTransfer(transferId, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs){
      switch (field) {
        case 'auth_key':
        case 'transfer_id':
          let isValid = refs.auth_key.state.value && refs.transfer_id.state.value;

          refs.btn.setState({
            disabled: !isValid
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
