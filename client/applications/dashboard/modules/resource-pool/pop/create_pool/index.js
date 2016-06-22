var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  var algorithm = [{
    name: __.round_robin,
    id: 'round_robin'
  }, {
    name: __.least_connections,
    id: 'least_connections'
  }, {
    name: __.source_ip,
    id: 'source_ip'
  }];
  config.fields[3].data = algorithm;

  if(obj) {
    config.title = ['modify', 'resource', 'pool'];
    config.btn.value = 'modify';
  } else {
    config.title = ['create', 'resource', 'pool'];
    config.btn.value = 'create';
  }

  var getListenersUnderType = function(items) {
    var listeners = {};
    items.forEach(item => {
      if(!item.default_pool_id) {
        if(item.protocol === 'TCP') {
          listeners.tcp = [];
          listeners.tcp.push(item);
        } else {
          listeners.http = [];
          listeners.http.push(item);
        }
      }
    });

    return listeners;
  };

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if(obj) {
        refs.name.setState({
          value: obj.name
        });
        refs.load_algorithm.setState({
          value: obj.lb_algorithm.toLowerCase()
        });
        refs.desc.setState({
          value: obj.description
        });
        refs.protocol.setState({
          value: obj.protocol,
          disabled: true
        });

        refs.listener.setState({
          data: [obj.listener],
          value: obj.listener.id,
          disabled: true
        });

        //checkbox to modify the healthmonitor associated with the pool
        if(obj.healthmonitor) {
          refs.modify_hm.setState({
            hide: false
          });
          refs.delay.setState({
            value: obj.healthmonitor.delay
          });
          refs.timeout.setState({
            value: obj.healthmonitor.timeout
          });
          refs.max_retries.setState({
            value: obj.healthmonitor.max_retries
          });
        }

        refs.btn.setState({
          disabled: false
        });
      } else {
        request.getListeners(true).then(res => {
          var listeners = getListenersUnderType(res);
          refs.listener.setState({
            listeners: listeners
          });

          var p = refs.protocol.state.data[0].name;
          refs.protocol.setState({
            value: p
          });
          refs.load_algorithm.setState({
            value: refs.load_algorithm.state.data[0].id
          });

        });
      }
    },
    onConfirm: function(refs, cb) {
      if(obj) {
        var updateParam = {
          name: refs.name.state.value,
          lb_algorithm: refs.load_algorithm.state.value.toUpperCase(),
          description: refs.desc.state.value
        };

        if(!refs.modify_hm.state.checked) {
          request.updatePool(obj.id, updateParam).then(res => {
            callback && callback();
            cb(true);
          }).catch(function(error) {
            cb(false, getErrorMessage(error));
          });
        } else {
          var updateMonitor = {
            delay: refs.delay.state.value,
            timeout: refs.timeout.state.value,
            max_retries: refs.max_retries.state.value
          };

          request.updatePool(obj.id, updateParam).then(res => {
            request.updateMonitor(obj.healthmonitor.id, updateMonitor).then(r => {
              callback && callback();
              cb(true);
            }).catch(er => {
              cb(false, getErrorMessage(er));
            });
          });
        }
      } else {
        var param = {
          name: refs.name.state.value,
          listener_id: refs.listener.state.value,
          protocol: refs.protocol.state.value.toUpperCase(),
          lb_algorithm: refs.load_algorithm.state.value.toUpperCase(),
          description: refs.desc.state.value
        };

        request.createPool(param).then(res => {
          callback && callback();
          cb(true);
        }).catch(function(error) {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, status, refs) {
      if(!obj) {
        switch(field) {
          case 'protocol':
            var listeners = refs.listener.state.listeners;
            if(listeners) {
              var tcpL = listeners.tcp,
                httpL = listeners.http;

              if(refs.protocol.state.value === 'TCP') {
                refs.listener.setState({
                  data: tcpL,
                  value: tcpL ? tcpL[0].id : ''
                });
              } else {
                refs.listener.setState({
                  data: httpL,
                  value: httpL ? httpL[0].id : ''
                });
              }
            }
            break;
          default:
            break;
        }
        if(refs.protocol.state.value && refs.listener.state.value && refs.load_algorithm.state.value) {
          refs.btn.setState({
            disabled: false
          });
        }
      } else {
        var delay = refs.delay.state,
          timeout = refs.timeout.state,
          retries = refs.max_retries.state,
          hmFilled = delay.value && timeout.value && retries.value && !delay.error && !timeout.error && !retries.error;
        switch(field) {
          case 'modify_hm':
            var modifyHm = refs.modify_hm.state.checked;
            if(obj.healthmonitor) {
              refs.delay.setState({
                hide: !modifyHm
              });
              refs.timeout.setState({
                hide: !modifyHm
              });
              refs.max_retries.setState({
                hide: !modifyHm
              });
            } else if(!obj.healthmonitor) {
              refs.pool_no_hm.setState({
                hide: !modifyHm
              });
            }
            break;
          case 'delay':
            if(delay.value > 1 && delay.value < 61) {
              refs.delay.setState({
                error: false
              });
            } else {
              refs.delay.setState({
                error: true
              });
            }
            break;
          case 'timeout':
            if(timeout.value > 4 && timeout.value < 301) {
              refs.timeout.setState({
                error: false
              });
            } else {
              refs.timeout.setState({
                error: true
              });
            }
            break;
          case 'max_retries':
            if(retries.value > 0 && retries.value < 11) {
              refs.max_retries.setState({
                error: false
              });
            } else {
              refs.max_retries.setState({
                error: true
              });
            }
            break;
          default:
            break;
        }
        if(refs.modify_hm.state.checked) {
          if(hmFilled) {
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.btn.setState({
              disabled: true
            });
          }
        } else {
          refs.btn.setState({
            disabled: false
          });
        }
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
