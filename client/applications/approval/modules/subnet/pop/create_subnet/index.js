var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');

var createNetwork = require('client/applications/approval/modules/network/pop/create_network/index');
var subnetDescription = require('../subnet_description/index');

function pop(obj, parent, callback) {

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getNetworks().then((data) => {
        if (data.length > 0) {
          var selectedItem = data[0].id;
          if (obj && obj.id) {
            selectedItem = obj.id;
          }
          var networks = [];
          data.forEach((ele) => {
            if (!ele.shared) {
              networks.push(ele);
            }
          });
          refs.select_network.setState({
            data: networks,
            value: selectedItem
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var data = {};
      data.detail = {};
      var createDetail = data.detail;

      createDetail.create = [];
      var configCreate = createDetail.create;
      var createItem = {};

      createItem = {
        _type: 'Subnet',
        _identity  : 'subnet',
        ip_version: 4,
        name: refs.subnet_name.state.value,
        network: refs.select_network.state.value,
        cidr: refs.net_address.state.value,
        enable_dhcp: refs.enable_dhcp.state.checked
      };

      var gwChecked = refs.enable_gw.state.checked;
      if (!gwChecked) {
        createItem.gateway_ip = null;
      } else {
        if (refs.gw_address.state.value) {
          createItem.gateway_ip = refs.gw_address.state.value;
        }

        let dns1 = refs.subnet_dns1.state.value;
        let dns2 = refs.subnet_dns2.state.value;
        if (dns1 || dns2) {
          let dns = [];
          dns1 && dns.push(dns1);
          dns2 && dns.push(dns2);
          createItem.dns_nameservers = dns;
        }
      }

      configCreate.push(createItem);

      var netAddr = refs.net_address.state.value,
        testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
      if(!testAddr.test(netAddr)) {
        refs.net_address.setState({
          error: true
        });
      } else {
        subnetDescription(data);
        cb(true);
      }
    },
    onAction: function(field, status, refs) {
      var netState = refs.net_address.state;
      switch (field) {
        case 'enable_gw':
          refs.gw_address.setState({
            disabled: !refs.enable_gw.state.checked
          });
          break;
        case 'show_more':
          refs.enable_gw.setState({
            hide: !status.checked
          });
          refs.gw_address.setState({
            hide: !status.checked
          });
          refs.enable_dhcp.setState({
            hide: !status.checked
          });
          refs.subnet_dns1.setState({
            hide: !status.checked
          });
          refs.subnet_dns2.setState({
            hide: !status.checked
          });
          break;
        case 'select_network':
          if (refs.select_network.state.clicked) {
            createNetwork(refs.modal, (res) => {
              refs.select_network.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
              });
            });
          }
          break;
        case 'net_address':
          if(netState.error === true && netState.value === '') {
            refs.net_address.setState({
              error: false
            });
          }
          break;
        default:
          break;
      }
      refs.btn.setState({
        disabled: !(!netState.error && netState.value)
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
