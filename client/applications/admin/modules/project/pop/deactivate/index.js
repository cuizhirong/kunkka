const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');

function pop(obj, parent, callback) {
  config.fields[0].info = __[config.fields[0].field].replace('{0}', obj.name);

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {
        enabled : false
      };
      request.editProject(obj.id, data).then((res) => {
        callback && callback(res.project);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'de_project_tip':
          refs.btn.setState({
            disabled: !status.checked
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
