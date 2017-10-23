const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      refs.btn.setState({
        disabled: true
      });
      let backupData = {
        backup : {
          name: refs.name.state.value,
          volume_id: obj.id
        }
      };
      refs.container.state.value ? backupData.backup.container = refs.container.state.value : null;
      refs.description.state.value ? backupData.backup.description = refs.description.state.value : null;
      refs.incremental.checked ? backupData.backup.incremental = refs.incremental.checked : null;
      refs.force.checked ? backupData.backup.force = refs.force.checked : null;

      request.createBackup(backupData).then(_res => {
        callback && callback(_res);
        cb(true);
      }).catch(err => {
        refs.btn.setState({
          disabled: true
        });
        this.setState({
          errorMessage: getErrorMessage(err)
        });
      });
    },
    onAction: function(field, status, refs){
      switch (field) {
        case 'name':
          let regex = /^[a-zA-Z0-9_.]{1,}$/;
          if (!regex.exec(refs.name.state.value)) {
            refs.name.setState({
              error: true
            });
            refs.btn.setState({
              disabled: true
            });
          } else {
            refs.name.setState({
              error: false
            });
            refs.btn.setState({
              disabled: false
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
