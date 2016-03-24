var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, btnType, callback, parent) {
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
      if(btnType) {
        networkId = {
          interfaceAttachment: {
            port_id: obj.id
          }
        };
      } else {
        networkId = {
          interfaceAttachment: {
            net_id: obj.network_id
          }
        };
      }
      request.addInstance(refs.instance.state.value, networkId).then((res) => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
