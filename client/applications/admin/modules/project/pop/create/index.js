var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  if (obj) {
    config.fields[0].value = obj.name;
    config.fields[2].value = obj.description;
    config.btn.value = 'modify';
    config.btn.type = 'update';
  } else {
    config.fields[0].value = '';
    config.fields[2].value = '';
    config.btn.value = 'create';
    config.btn.type = 'create';
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getDomains().then((res) => {
        refs.domain.setState({
          data: res,
          value: res[0].id
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
        request.editProject(obj.id, data).then((res) => {
          callback && callback(res.project);
          cb(true);
        });
      } else {
        request.createProject(data).then((res) => {
          callback && callback(res.projecte);
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
