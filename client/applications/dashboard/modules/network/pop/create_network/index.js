var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(parent, callback) {
  if (!HALO.settings.is_show_vlan) {
    config.fields[2].hide = true;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.network_name.state.value
      };
      // check vlan
      if (refs.enable_vlan.state.checked) {
        data['provider:network_type'] = 'vlan';
        let v = refs.vlan_id.state.value.trim();
        if (v !== '') {
          data['provider:segmentation_id'] = v;
          data['provider:physical_network'] = 'physnet3';
        }
      }

      if (!refs.enable_security.state.checked) {
        data.port_security_enabled = false;
      }

      if(refs.create_subnet.state.checked) {
        var netAddr = refs.net_address.state.value,
          testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
        if(!testAddr.test(netAddr)) {
          refs.net_address.setState({
            error: true
          });
        } else {
          request.createNetwork(data).then((res) => {
            data = {
              ip_version: 4,
              name: refs.subnet_name.state.value,
              network_id: res.network.id,
              cidr: refs.net_address.state.value,
              enable_dhcp: true
            };
            request.createSubnet(data).then(() => {
              callback && callback(res.network);
              cb(true);
            });
          });
        }
      } else {
        request.createNetwork(data).then((res) => {
          callback && callback(res.network);
          cb(true);
        });
      }
    },
    onAction: function(field, status, refs) {
      var subnetChecked = refs.create_subnet.state.checked;
      switch (field) {
        case 'create_subnet':
          refs.subnet_name.setState({
            hide: !subnetChecked
          });
          refs.net_address.setState({
            hide: !subnetChecked
          });
          break;
        case 'enable_vlan':
          refs.vlan_id.setState({
            hide: !refs.enable_vlan.state.checked
          });
          break;
        case 'net_address':
          var netState = refs.net_address.state;
          if(netState.error === true && netState.value === '') {
            refs.net_address.setState({
              error: false
            });
            refs.btn.setState({
              disabled: false
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
