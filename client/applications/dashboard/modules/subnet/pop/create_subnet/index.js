var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

var createNetwork = require('client/applications/dashboard/modules/network/pop/create_network/index');

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
      var data = {
        ip_version: 4,
        name: refs.subnet_name.state.value,
        network_id: refs.select_network.state.value,
        cidr: refs.net_address.state.value,
        enable_dhcp: refs.enable_dhcp.state.checked
      };

      var gwChecked = refs.enable_gw.state.checked;
      if (!gwChecked) {
        data.gateway_ip = null;
      } else {
        if (refs.gw_address.state.value) {
          data.gateway_ip = refs.gw_address.state.value;
        }

        let dns1 = refs.subnet_dns1.state.value;
        let dns2 = refs.subnet_dns2.state.value;
        if (dns1 || dns2) {
          let dns = [];
          dns1 && dns.push(dns1);
          dns2 && dns.push(dns2);
          data.dns_nameservers = dns;
        }
      }

      request.createSubnet(data).then((res) => {
        callback && callback(res.subnet);
        cb(true);
      }).catch((err) => {
        var reg = new RegExp('"message":"(.*)","');
        var tip = reg.exec(err.response)[1];

        refs.error.setState({
          value: tip,
          hide: false
        });
        cb(false);
      });
    },
    onAction: function(field, status, refs) {
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
          var netState = refs.net_address.state,
            testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
          if(!testAddr.test(netState.value)) {
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
            if (refs.select_network.state.data.length) {
              refs.btn.setState({
                disabled: false
              });
            } else {
              refs.btn.setState({
                disabled: true
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
