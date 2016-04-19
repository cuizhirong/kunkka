var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  if (obj) {
    config.fields[0].value = obj.name;
    config.btn.value = 'modify';
    config.btn.type = 'update';
    config.btn.disabled = false;
  } else {
    config.fields[0].value = '';
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
        name: refs.name.state.value
      };
      if (obj) {
        request.editRole(obj.id, data).then((res) => {
          callback && callback(res.role);
          cb(true);
        });
      } else {
        request.createRole(data).then((res) => {
          callback && callback(res.role);
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
