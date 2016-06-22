var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../../lb/request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getList().then(loadbalancers => {
        var lbs = loadbalancers.filter(lb => {
          if(lb.floatingip) {
            return false;
          }
          return true;
        });
        refs.lb.setState({
          data: lbs,
          value: lbs[0] ? lbs[0].id : ''
        });
      });
    },
    onConfirm: function(refs, cb) {
      var portID = refs.port.state.value;
      request.associateFloatingIp(portID, obj.id).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'lb':
          refs.lb.state.data.some(lb => {
            if(lb.id === refs.lb.state.value) {
              var ports = [{
                name: lb.vip_address,
                id: lb.vip_port_id
              }];
              refs.port.setState({
                hide: false,
                data: ports,
                value: ports[0].id
              });
              refs.btn.setState({
                disabled: false
              });
            }
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
