var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(callback, parent) {

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getList().then((data) => {
        refs.select_network.setState({
          data: data.network,
          value: data.network[0].id
        });
        refs.btn.setState({
          disabled: false
        });
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
      request.createSubnet(data);
      /*request.createSubnet(data).then((message) => {
        console.log(message);
      }).catch((error) => {
        console.log(error);
      });*/
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {
      switch(field) {
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
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
