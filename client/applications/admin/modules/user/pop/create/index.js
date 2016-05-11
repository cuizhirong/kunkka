var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  if (obj) {
    config.title = ['modify', 'user'];
    config.fields[0].value = obj.name;
    config.fields[1].value = obj.email;
    config.fields[2].value = obj.description;
    config.btn.value = 'modify';
    config.btn.type = 'update';
    config.btn.disabled = false;
  } else {
    config.title = ['create', 'user'];
    config.fields[0].value = '';
    config.fields[1].value = '';
    config.fields[2].value = '';
    config.btn.value = 'create';
    config.btn.type = 'create';
    config.btn.disabled = true;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.name.state.value,
        description: refs.describe.state.value,
        email: refs.email.state.value,
        password: '123'
      };
      if (obj) {
        request.editUser(obj.id, data).then((res) => {
          callback && callback(res.user);
          cb(true);
        });
      } else {
        request.createUser(data).then((res) => {
          callback && callback(res.user);
          cb(true);
        });
      }
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'name':
          refs.btn.setState({
            disabled: !status.value
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
