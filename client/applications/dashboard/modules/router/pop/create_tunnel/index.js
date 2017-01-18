var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('../../../../utils/error_message');
var popTarget = require('./target_network');
var popSelect = require('./select');
var createVpnService = require('../create_vpn_service/index');
var createIkePolicy = require('client/applications/dashboard/modules/ike-policy/pop/create/index');
var createIpsecPolicy = require('client/applications/dashboard/modules/ipsec-policy/pop/create/index');

function pop(obj, parent, callback) {
  config.fields[0].text = __.layer_three;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.vpn_service.setState({
        renderer: popSelect,
        data: obj.vpnservices,
        value: obj.vpnservices[0] && obj.vpnservices[0].id
      });
      refs.target_network.setState({
        renderer: popTarget
      });

      refs.ipsec_policy.setState({
        renderer: popSelect,
        data: obj.ipsecpolicies,
        value: obj.ipsecpolicies[0] && obj.ipsecpolicies[0].id
      });

      refs.ike_policy.setState({
        renderer: popSelect,
        data: obj.ikepolicies,
        value: obj.ikepolicies[0] && obj.ikepolicies[0].id
      });

    },
    onConfirm: function(refs, cb) {
      var data = {
        ipsec_site_connection: {
          name: refs.name.state.value,
          ipsecpolicy_id: refs.ipsec_policy.refs.select.state.value,
          ikepolicy_id: refs.ike_policy.refs.select.state.value,
          vpnservice_id: refs.vpn_service.refs.select.state.value,
          admin_state_up: true,
          peer_address: refs.remote_ip.state.value,
          peer_id: refs.remote_ip.state.value,
          psk: refs.key.state.value,
          peer_cidrs: refs.target_network.refs.network.state.networkIps
        }
      };
      request.createTunnel(data).then(res => {
        callback && callback();
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'ike_policy':
          if (status.clicked) {
            createIkePolicy(refs.modal, (res) => {
              refs.ike_policy.refs.select.setState({
                data: obj.ikepolicies.concat(res.ikepolicy),
                value: obj.ikepolicies[0] ? obj.ikepolicies[0].id : res.id,
                clicked: false,
                renderer: popSelect
              });
              refs.btn.setState({
                disabled: false
              });
            });
          }
          break;
        case 'ipsec_policy':
          if (status.clicked) {
            createIpsecPolicy(refs.modal, (res) => {
              refs.ipsec_policy.refs.select.setState({
                data: obj.ipsecpolicies.concat(res.ipsecpolicy),
                value: obj.ipsecpolicies[0] ? obj.ipsecpolicies[0].id : res.id,
                clicked: false,
                renderer: popSelect
              });
              refs.btn.setState({
                disabled: false
              });
            });
          }
          break;
        case 'vpn_service':
          if (status.clicked) {
            createVpnService(obj, refs.modal, (res) => {
              refs.vpn_service.refs.select.setState({
                data: obj.vpnservices.concat(res),
                value: obj.vpnservices[0] ? obj.vpnservices[0].id : res.id,
                clicked: false,
                renderer: popSelect
              });
              refs.btn.setState({
                disabled: false
              });
              callback && callback();
            });
          }
          break;
        default:
          break;
      }
      var vpnService = refs.vpn_service.refs.select && refs.vpn_service.refs.select.state.data.length,
        ikePolicy = refs.ike_policy.refs.select && refs.ike_policy.refs.select.state.data.length,
        ipsecPolicy = refs.ipsec_policy.refs.select && refs.ipsec_policy.refs.select.state.data.length;
      if (vpnService && ikePolicy && ipsecPolicy) {
        refs.btn.setState({
          disabled: false
        });
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
