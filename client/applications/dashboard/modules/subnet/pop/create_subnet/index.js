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
          refs.btn.setState({
            disabled: false
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
      if (!refs.enable_gw.state.checked) {
        data.gateway_ip = null;
      } else if (refs.gw_address.state.value) {
        data.gateway_ip = refs.gw_address.state.value;
      }
      request.createSubnet(data).then((res) => {
        callback && callback(res.subnet);
        cb(true);
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
            hide: !refs.show_more.state.checked
          });
          refs.gw_address.setState({
            hide: !refs.show_more.state.checked
          });
          refs.enable_dhcp.setState({
            hide: !refs.show_more.state.checked
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
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
