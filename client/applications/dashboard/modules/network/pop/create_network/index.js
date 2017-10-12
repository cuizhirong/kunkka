const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(parent, callback) {
  if (!HALO.settings.is_show_vlan) {
    config.fields[2].hide = true;
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs, field) {
    },
    onConfirm: function(refs, cb) {
      let data = {
        name: refs.network_name.state.value
      };
      if (!refs.enable_security.state.checked) {
        data.port_security_enabled = false;
      }

      if(refs.create_subnet.state.checked) {
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
      } else {
        request.createNetwork(data).then((res) => {
          callback && callback(res.network);
          cb(true);
        }).catch(err => {
          cb(false, getErrorMessage(err));
        });
      }
    },
    onAction: function(field, status, refs) {
      let subnetChecked = refs.create_subnet.state.checked,
        netVlanstate = refs.net_address.state,
        testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
      if (subnetChecked && testAddr.test(netVlanstate.value)) {
        refs.btn.setState({
          disabled: netVlanstate.value === ''
        });
      } else if (!subnetChecked) {
        refs.btn.setState({
          disabled: false
        });
      }
      switch (field) {
        case 'create_subnet':
          refs.subnet_name.setState({
            hide: !subnetChecked
          });
          refs.net_address.setState({
            hide: !subnetChecked
          });
          refs.btn.setState({
            disabled: netVlanstate.value === ''
          });
          break;
        case 'net_address':
          if(refs.create_subnet.state.checked) {
            if (!testAddr.test(netVlanstate.value)) {
              if(netVlanstate.value !== '') {
                refs.net_address.setState({
                  error: true
                });
                refs.btn.setState({
                  disabled: true
                });
              } else {
                refs.net_address.setState({
                  error: false
                });
                refs.btn.setState({
                  disabled: true
                });
              }
            } else {
              refs.net_address.setState({
                error: false
              });
            }
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
