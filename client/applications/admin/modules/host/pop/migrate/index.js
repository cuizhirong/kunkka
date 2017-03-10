var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, parent, callback) {
  var {row, hostTypes} = obj;

  var currentHost = row.service.host;
  config.fields[0].text = currentHost;

  var hosts = [];
  hosts.push({
    id: 'auto',
    name: __.auto
  });

  hostTypes.forEach((host) => {
    var name = host.service.host;

    if (currentHost !== name) {
      hosts.push({
        id: name,
        name: name
      });
    }
  });

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.migrate_to.setState({
        data: hosts,
        value: hosts[0].id
      });
    },
    onConfirm: function(refs, cb) {
      let randomly = refs.migrate_host_tip.state.checked,
        checkedField = refs.migrate_to.state.checkedField,
        dest = '';
      if(checkedField === 'migrate_to') {//set dest by select
        dest = refs.migrate_to.state.value;
        if (dest === 'auto') {
          dest = null;
        }
        request.migrate(currentHost, dest, randomly);
        cb(true);
      } else {//set dest by id
        dest = refs.migrate_to_other.state.value;

        request.getHypervisorById(dest).then(host => {
          request.migrate(currentHost, dest, randomly);
          cb(true);
        }).catch((err) => {
          cb(false, getErrorMessage(err));
        });
      }
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'migrate_to':
          refs.migrate_to_other.setState({
            checkedField: state.checkedField
          });

          if(state.checkedField === 'migrate_to') {
            let selectDisabled = refs.migrate_to.state.data.length === 0;
            refs.btn.setState({
              disabled: selectDisabled
            });
          }
          break;
        case 'migrate_to_other':
          refs.migrate_to.setState({
            checkedField: state.checkedField
          });
          let host = refs.migrate_to_other.state.value,
            hostFail = (host === row.id.toString()) || (host === '');
          refs.migrate_to_other.setState({
            error: hostFail
          });
          break;
        case 'migrate_host_tip':
          return;
        default:
          break;
      }

      let enableBtn = (state.checkedField === 'migrate_to' && !!refs.migrate_to.state.value)
        || (state.checkedField === 'migrate_to_other' && !refs.migrate_to_other.state.error);
      refs.btn.setState({
        disabled: !enableBtn
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
