var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      var floatingIP = refs.floating_ip.state.value,
        projectId = refs.target_project_id.state.value,
        networkID = '';
      request.getExternalNetwork(projectId).then((res) => {
        networkID = res.networks[0].id;
      }).then(() => {
        let data = {
          'floatingip': {
            'floating_network_id': networkID,
            'tenant_id': projectId,
            'floating_ip_address': floatingIP
          }
        };
        if(HALO.settings.enable_floatingip_bandwidth) {
          data.floatingip.rate_limit = 1024;
        }
        request.allocateFloatingIP(data).then(() => {
          callback && callback();
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
