var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var popSlider = require('./com_slider');
var enableCharge = HALO.settings.enable_charge;

function pop(obj, parent, actionModify, callback) {
  if(actionModify) {
    config.title = ['modify', 'listener'];
    config.btn.value = 'modify';
  } else {
    config.title = ['create', 'listener'];
    config.btn.value = 'create';
  }

  if (enableCharge) {
    config.fields[4].hide = false;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    cacheKey : [],
    cacheValue: [],
    onInitialize: function(refs) {
      var initValue = 10000;
      refs.connection_limit.setState({
        renderer: popSlider,
        value: initValue
      });
      if (enableCharge) {
        request.getPrice('listener', actionModify ? obj.connection_limit : initValue).then((res) => {
          refs.charge.setState({
            value: res.unit_price
          });
          this.cacheKey.push(initValue);
          this.cacheValue.push(res.unit_price);
        });
      }

      if(actionModify) {
        refs.name.setState({
          value: obj.name
        });
        refs.connection_limit.setState({
          value: obj.connection_limit
        });
        refs.listener_protocol.setState({
          value: obj.protocol,
          disabled: true
        });
        refs.protocol_port.setState({
          value: obj.protocol_port,
          required: false,
          disabled: true
        });
      } else {
        refs.listener_protocol.setState({
          value: refs.listener_protocol.state.data[0].id
        });
      }
    },
    onConfirm: function(refs, cb) {
      if(actionModify) {
        var updateData = {
          name: refs.name.state.value,
          connection_limit: refs.connection_limit.state.value
        };

        request.updateListener(obj.id, updateData).then(res => {
          callback && callback();
          cb(true);
        }).catch(function(error) {
          cb(false, getErrorMessage(error));
        });
      } else {
        var listenerData = {
          name: refs.name.state.value,
          protocol: refs.listener_protocol.state.value,
          protocol_port: refs.protocol_port.state.value,
          loadbalancer_id: obj.id,
          connection_limit: refs.connection_limit.state.value
        };

        request.createListener(listenerData).then(res => {
          callback && callback();
          cb(true);
        }).catch(function(error) {
          cb(false, getErrorMessage(error));
        });
      }
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
        case 'connection_limit':
          if (HALO.settings.enable_charge) {
            var sliderEvent = refs.connection_limit.refs.slider.state.eventType;
            if (sliderEvent === 'mouseup') {
              var conValue = refs.connection_limit.state.value;
              if(this.cacheKey.includes(conValue)) {
                refs.charge.setState({
                  value: this.cacheValue[this.cacheKey.indexOf(conValue)]
                });
              } else {
                request.getPrice('listener', conValue).then((res) => {
                  refs.charge.setState({
                    value: res.unit_price
                  });
                  this.cacheKey.push(conValue);
                  this.cacheValue.push(res.unit_price);
                }
                ).catch((error) => {});
              }
            }
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
