var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      if (refs.password.state.value !== refs.confirm_password.state.value) {
        refs.password.setState({
          error: true
        });
        refs.confirm_password.setState({
          error: true
        });
        return;
      }
      var data = {
        name: obj.name,
        password: refs.password.state.value
      };

      request.editUser(obj.id, data).then((res) => {
        callback && callback(res.user);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'password':
          var pwd = refs.password.state.value;
          refs.password.setState({
            error: pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd)
          });
          var _rePsw = refs.confirm_password.state.value;
          var _valid = pwd && (pwd === _rePsw);
          refs.btn.setState({
            disabled: !_valid
          });
          break;
        case 'confirm_password':
          var psw = refs.password.state.value;
          var rePsw = refs.confirm_password.state.value;
          var valid = psw && (psw === rePsw);
          refs.btn.setState({
            disabled: !valid
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
