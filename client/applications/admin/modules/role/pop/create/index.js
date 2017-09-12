const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  if (obj) {
    config.title = ['modify', 'role'];
    config.fields[0].value = obj.name;
    config.btn.value = 'modify';
    config.btn.type = 'update';
    config.btn.disabled = false;
  } else {
    config.title = ['create', 'role'];
    config.fields[0].value = '';
    config.btn.value = 'create';
    config.btn.type = 'create';
    config.btn.disabled = true;
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {
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
