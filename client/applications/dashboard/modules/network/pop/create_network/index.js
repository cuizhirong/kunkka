var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(parent, callback) {

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.network_name.state.value
      };
      if (!refs.enable_security.state.checked) {
        data.port_security_enabled = false;
      }
      request.createNetwork(data).then((res) => {
        if (refs.create_subnet.state.checked) {
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
        } else {
          callback && callback(res.network);
          cb(true);
        }
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'create_subnet':
          refs.subnet_name.setState({
            hide: !refs.create_subnet.state.checked
          });
          refs.net_address.setState({
            hide: !refs.create_subnet.state.checked
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
