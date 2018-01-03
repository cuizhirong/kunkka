const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getStatusIcon = require('../../../../utils/status_icon');

function pop(obj, objj, parent, callback) {
  let deleteName = obj[0].name.split('/');
  let deleteShow = deleteName[deleteName.length - 2];
  let folderLength = obj.length > 1;
  config.fields[1].hide = !folderLength;
  config.btn.disabled = folderLength;
  config.fields[0].data = [obj[0]];
  config.fields[0].data[0].name = deleteShow;
  config.fields[0].getStatusIcon = getStatusIcon;
  config.fields[0].number = obj.length;
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.deleteFolder(objj).then((res) => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'delete_folder_tip':
          refs.btn.setState({
            disabled: !state.checked
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
