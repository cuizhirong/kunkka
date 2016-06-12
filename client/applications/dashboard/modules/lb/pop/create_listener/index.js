var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.listener_protocol.setState({
        value: refs.listener_protocol.state.data[0].id
      });
    },
    onConfirm: function(refs, cb) {
      var listenerData = {
        name: refs.name.state.value,
        protocol: refs.listener_protocol.state.value,
        protocol_port: refs.protocol_port.state.value,
        loadbalancer_id: obj.id
      };

      request.createListener(listenerData).then(res => {
        callback && callback();
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'protocol_port':
          var portRange = refs.protocol_port.state.value;
          if(portRange > 0 && portRange < 65536) {
            refs.protocol_port.setState({
              error: false
            });
            if(refs.name.state.value) {
              refs.btn.setState({
                disabled: false
              });
            }
          } else {
            refs.protocol_port.setState({
              error: true
            });
            refs.btn.setState({
              disabled: true
            });
          }
          break;
        case 'name':
          if(refs.name.state.value && refs.protocol_port.state.value) {
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.btn.setState({
              disabled: true
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
