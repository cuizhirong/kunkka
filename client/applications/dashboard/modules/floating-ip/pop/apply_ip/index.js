var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.getNetworks().then((networks) => {
        var floatingNetworkId = networks.filter((item) => item['router:external'])[0].id;
        var data = {};
        data.floatingip = {};
        data.floatingip.floating_network_id = floatingNetworkId;

        request.createFloatingIp(data).then((res) => {
          callback && callback(res.floatingip);
          cb(true);
        });
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'bandwidth':
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
