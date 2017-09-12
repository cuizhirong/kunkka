const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function invalidPwd(pwd) {
  return (pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) ||
!/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd));
}

function pop(obj, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let password = refs.password.state.value;
      let data = {
        changePassword: {
          adminPass: password
        }
      };

      request.updatePassword(obj.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });

    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'password':
        case 'confirm_pwd':
          let pwd1 = refs.password.state.value;
          let pwd2 = refs.confirm_pwd.state.value;

          refs.confirm_pwd.setState({
            error: (pwd1 !== pwd2) || invalidPwd(pwd1) || invalidPwd(pwd2)
          });
          refs.btn.setState({
            disabled: (pwd1 !== pwd2) || invalidPwd(pwd1) || invalidPwd(pwd2)
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
