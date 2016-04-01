var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

var gatewayId = null;
function pop(parent, callback) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getGateway().then((res) => {
        gatewayId = res;
        refs.btn.setState({
          disabled: false
        });
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.name.state.value
      };
      if (refs.enable_public_gateway.state.checked) {
        data.external_gateway_info = {
          network_id: gatewayId
        };
      }
      request.createRouter(data).then((res) => {
        callback && callback(res.router);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
