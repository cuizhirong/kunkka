const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.editUser(obj.id, {
        name: obj.name,
        default_project_id: refs.project.state.value
      }).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'project':
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
