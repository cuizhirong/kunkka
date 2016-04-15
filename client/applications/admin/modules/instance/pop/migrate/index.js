var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  var {row, hostTypes} = obj;

  config.fields[0].text = row.name;
  config.fields[1].text = row.tenant_id;
  config.fields[2].text = row.user_id;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      var hosts = [];
      hosts.push({
        id: 'auto',
        name: __.auto
      });

      hostTypes.forEach((host) => {
        hosts.push({
          id: host.id,
          name: host.hypervisor_hostname
        });
      });

      refs.migrate_to.setState({
        data: hosts,
        value: hosts[0].id
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        removeFloatingIp: {
          address: ''
        }
      };
      request.dissociateFloatingIp(obj.id, data).then((res) => {
        callback && callback(res);
        cb(true);
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
