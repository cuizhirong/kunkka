var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

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
        request.allocateFloatingIP(floatingIP, networkID, projectId).then(() => {
          callback && callback();
          cb(true);
        });
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
