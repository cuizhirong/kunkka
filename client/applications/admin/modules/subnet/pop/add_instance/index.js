const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(obj, isDetail, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances(obj.project_id).then((sameProject) => {
        if (sameProject.length > 0) {
          refs.instance.setState({
            data: sameProject,
            value: sameProject[0].id,
            hide: false
          });
          refs.btn.setState({
            disabled: false
          });
        } else {
          refs.instance.setState({
            hide: false
          });
          refs.btn.setState({
            disabled: true
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let networkId = {};
      if (isDetail) {
        networkId = {
          interfaceAttachment: {
            port_id: obj.id
          }
        };
        request.addInstance(refs.instance.state.value, networkId).then((res) => {
          callback && callback(res);
          cb(true);
        });
      } else {
        let port = {
          network_id: obj.network_id,
          fixed_ips: [{
            subnet_id: obj.id
          }],
          port_security_enabled: obj.portSecurityEnabled
        };
        request.createPort(port).then((p) => {
          networkId = {
            interfaceAttachment: {
              port_id: p.port.id
            }
          };
          request.addInstance(refs.instance.state.value, networkId).then((res) => {
            callback && callback(res);
            cb(true);
          });
        });
      }
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
