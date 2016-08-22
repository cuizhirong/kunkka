var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var popTarget = require('../create_tunnel/target_network');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = __.layer_three;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.name.setState({
        value: obj.name
      });
      refs.remote_ip.setState({
        value: obj.peer_address
      });
      refs.key.setState({
        value: obj.psk
      });
      refs.target_network.setState({
        renderer: popTarget,
        data: obj.peer_cidrs
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        ipsec_site_connection: {
          name: refs.name.state.value,
          admin_state_up: true,
          peer_address: refs.remote_ip.state.value,
          peer_id: refs.remote_ip.state.value,
          psk: refs.key.state.value,
          peer_cidrs: refs.target_network.refs.network.state.networkIps
        }
      };
      request.updateIpsecConnection(obj.id, data).then(res => {
        callback && callback(res.ipsec_site_connection);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
