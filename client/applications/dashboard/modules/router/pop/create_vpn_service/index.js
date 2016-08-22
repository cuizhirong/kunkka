var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.subnet.setState({
        data: obj.subnets,
        value: obj.subnets[0].id
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        vpnservice: {
          subnet_id: refs.subnet.state.value,
          router_id: obj.id,
          name: refs.name.state.value,
          admin_state_up: true
        }
      };
      request.createVpnService(data).then(res => {
        request.getSubnets().then((subnets) => {
          subnets.some((subnet) => {
            if (res.subnet_id === subnet.id) {
              res.subnet = subnet;
              return true;
            }
            return false;
          });
        });
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'subnet':
          refs.btn.setState({
            disabled: false
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
