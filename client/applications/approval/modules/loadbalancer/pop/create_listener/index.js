var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/approval.lang.json');
var request = require('../../request');
var popSlider = require('./com_slider');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.connection_limit.setState({
        renderer: popSlider,
        value: 10000
      });

      refs.listener_protocol.setState({
        value: refs.listener_protocol.state.data[0].id
      });
    },
    onConfirm: function(refs, cb) {
      var data = {};
      data.description = refs.apply_description.state.value;
      data.detail = {};
      data.detail.create = [];
      data.detail.type = 'direct';
      data.detail.resourceType = 'listener';
      var createDetail = data.detail.create;
      var listenerParam = {
        _type: 'Listener',
        _identity: 'listener',
        loadbalancer_id: obj.id,
        protocol: refs.listener_protocol.state.value,
        protocol_port: refs.protocol_port.state.value,
        name: refs.name.state.value,
        connection_limit: refs.connection_limit.state.value
      };
      createDetail.push(listenerParam);

      request.createApplication(data).then(res => {
        callback && callback();
        cb(true);
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
