var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  if (obj) {
    config.title = ['modify', 'user-group'];
    config.fields[0].value = obj.name;
    config.fields[1].value = obj.description;
    config.btn.value = 'modify';
    config.btn.type = 'update';
    config.btn.disabled = false;
  } else {
    config.title = ['create', 'user-group'];
    config.fields[0].value = '';
    config.fields[1].value = '';
    config.btn.value = 'create';
    config.btn.type = 'create';
    config.btn.disabled = true;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getDomains().then((res) => {
        refs.domain.setState({
          data: res,
          value: (obj && obj.domain_id) || res[0].id
        });
        if (refs.name.state.value || obj) {
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.name.state.value,
        description: refs.describe.state.value,
        domain_id: refs.domain.state.value
      };
      if (obj) {
        request.editGroup(obj.id, data).then((res) => {
          callback && callback(res.group);
          cb(true);
        });
      } else {
        request.createGroup(data).then((res) => {
          callback && callback(res.group);
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
