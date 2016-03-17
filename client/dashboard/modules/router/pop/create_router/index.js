var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

var gatewayId = null;
function pop(callback, parent) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getGateway((res) => {
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
        cb(true);
        callback && callback(res.router);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
