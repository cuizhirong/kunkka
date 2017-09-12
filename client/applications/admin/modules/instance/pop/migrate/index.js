const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/admin/utils/error_message');
const __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  let {row, hostTypes} = obj;

  config.fields[0].text = row.name;
  config.fields[1].text = row.tenant_id;
  config.fields[2].text = row.user_id;

  let hosts = [];
  hosts.push({
    id: 'auto',
    name: __.auto
  });

  let itemStatus = row.status.toLowerCase(),
    isCool = false;
  if(itemStatus === 'active' || itemStatus === 'paused') {
    isCool = false;
  } else if (itemStatus !== 'error' && itemStatus !== 'error_deleting') {
    isCool = true;
  }

  if(!isCool) {
    hostTypes.forEach((host) => {
      let name = host.service.host;

      if (row['OS-EXT-SRV-ATTR:host'] !== name) {
        hosts.push({
          id: name,
          name: name
        });
      }
    });
  }

  let props = {
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
      let hostID = refs.migrate_to.state.value;
      if (hostID === 'auto') {
        hostID = null;
      }

      request.migrate(row.id, hostID, isCool).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {
    },
    onLinkClick: function() {
    }
  };

  commonModal(props);
}

module.exports = pop;
