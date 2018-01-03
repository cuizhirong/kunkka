const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../../loadbalancer/request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getList().then(loadbalancers => {
        let lbs = loadbalancers.filter(lb => {
          if(lb.floatingip) {
            return false;
          }
          return true;
        });
        refs.lb.setState({
          data: lbs,
          value: lbs[0] ? lbs[0].id : ''
        });
        refs.btn.setState({
          disabled: lbs.length === 0 || !lbs[0].router.external_gateway_info
        });
      });
    },
    onConfirm: function(refs, cb) {
      let portID = refs.port.state.value;
      request.associateFloatingIp(portID, obj.id).then((res) => {
        if (HALO.settings.enable_floatingip_bandwidth) {
          request.changeBandwidth(obj.id, {
            fipratelimit: {}
          }).then(() => {
            callback && callback(res);
            cb(true);
          }).catch((error) => {
            cb(false, getErrorMessage(error));
          });
        } else {
          callback && callback(res);
          cb(true);
        }
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'lb':
          refs.lb.state.data.some(lb => {
            if(lb.id === refs.lb.state.value) {
              let ports = [{
                name: lb.vip_address,
                id: lb.vip_port_id
              }];
              refs.port.setState({
                hide: false,
                data: ports,
                value: ports[0].id
              });
              refs.btn.setState({
                disabled: !lb.router.external_gateway_info
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
