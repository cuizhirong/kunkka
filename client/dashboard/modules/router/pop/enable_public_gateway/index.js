var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('../../request');

var gatewayId = null;

function pop(obj, parent, callback) {
  config.fields[0].info = __[config.fields[0].field].replace('{0}', obj.name);
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
        external_gateway_info: {
          network_id: gatewayId
        }
      };
      request.updateRouter(obj.id, data).then((res) => {
        callback && callback(res.router);
        cb(true);
      });
    },
    onAction: function() {}
  };

  commonModal(props);
}

module.exports = pop;
