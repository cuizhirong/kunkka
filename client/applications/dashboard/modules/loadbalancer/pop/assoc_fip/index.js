var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');
var createFloatingIp = require('client/applications/dashboard/modules/floating-ip/pop/apply_ip/index');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getFloatingIpList().then(res => {
        var availableFIP = res.filter(fip => {
          if(!fip.fixed_ip_address) {
            fip.name = fip.floating_ip_address;
            return true;
          }
          return false;
        });
        refs.floating_ip.setState({
          data: availableFIP,
          value: availableFIP[0] ? availableFIP[0].id : ''
        });
        refs.btn.setState({
          disabled: false
        });
      });
    },
    onConfirm: function(refs, cb) {
      var fipID = refs.floating_ip.state.value,
        portID = obj.vip_port_id;
      request.associateFloatingIp(portID, fipID).then(res => {
        callback && callback();
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'floating_ip':
          if(refs.floating_ip.state.clicked) {
            createFloatingIp(refs.modal, (res) => {
              refs.floating_ip.setState({
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
