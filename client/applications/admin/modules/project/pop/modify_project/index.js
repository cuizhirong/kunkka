const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  config.title = ['modify', 'project'];
  config.fields[0].value = obj.name;
  config.fields[1].hide = true;
  config.fields[2].value = obj.description;
  config.fields[3].label = __.activate;
  config.fields[3].checked = obj.enabled;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      let data = {
        name: refs.name.state.value,
        description: refs.describe.state.value,
        enabled: refs.activate.state.checked
      };
      request.editProject(obj.id, data).then((res) => {
        callback && callback(res.project);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
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
