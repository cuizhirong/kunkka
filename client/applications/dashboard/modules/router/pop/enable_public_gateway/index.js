var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

var gatewayId = null;

function pop(obj, parent, callback) {
  var name = obj.name ? obj.name : '(' + obj.id.substr(0, 8) + ')';
  config.fields[0].info = __[config.fields[0].field].replace('{0}', name);

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getGateway().then((res) => {
        if(res.length > 0) {
          gatewayId = res[0].id;
          if(res.length > 1) {
            gatewayId = '';
            refs.external_network.setState({
              data: res,
              value: res[0].id,
              hide: false
            });
          }

          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        external_gateway_info: {
          network_id: gatewayId ? gatewayId : refs.external_network.state.value
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
