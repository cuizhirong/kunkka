var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(callback, parent) {

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.network_name.state.value
      };
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
            cb(true);
            callback && callback(res.network);
          });
        } else {
          cb(true);
          callback && callback(res.network);
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
