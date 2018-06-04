const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');

const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, callback) {
  config.fields[0].__ = __;

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {
      refs.user_name.setState({
        value: obj.username
      });
      refs.user_id.setState({
        value: obj.user_id
      });
      refs.video_account_id.setState({
        value: obj.account_id
      });
    },
    onConfirm: function(refs, cb) {
      refs.btn.setState({
        disabled: true
      });
      request.deleteAccountBinding(obj.id).then((res)=>{
        callback && callback();
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      }).finally(() => {
        refs.btn.setState({
          disabled: false
        });
      });
    },
    onAction: function() {}
  };

  commonModal(props);
}

module.exports = pop;
