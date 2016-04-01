var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, isDetail, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances().then((data) => {
        if (data.length > 0) {
          refs.instance.setState({
            data: data,
            value: data[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var networkId = {};
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
        var port = {
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
