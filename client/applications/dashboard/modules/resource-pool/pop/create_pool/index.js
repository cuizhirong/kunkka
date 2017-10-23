const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  let algorithm = [{
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

  let getListenersUnderType = function(items) {
    let listeners = {};
    listeners.tcp = [];
    listeners.http = [];
    items.forEach(item => {
      if(!item.default_pool_id) {
        if(item.protocol === 'TCP') {
          listeners.tcp.push(item);
        } else {
          listeners.http.push(item);
        }
      }
    });

    return listeners;
  };

  let props = {
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

        refs.btn.setState({
          disabled: false
        });
      } else {
        request.getListeners(true).then(res => {
          let listeners = getListenersUnderType(res);
          refs.listener.setState({
            listeners: listeners
          });

          let p = refs.protocol.state.data[0].name;
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
        let updateParam = {
          name: refs.name.state.value,
          lb_algorithm: refs.load_algorithm.state.value.toUpperCase(),
          description: refs.desc.state.value
        };

        request.updatePool(obj.id, updateParam).then(res => {
          callback && callback();
          cb(true);
        }).catch(function(error) {
          cb(false, getErrorMessage(error));
        });
      } else {
        let param = {
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
            let listeners = refs.listener.state.listeners;
            if(listeners) {
              let tcpL = listeners.tcp,
                httpL = listeners.http;

              if(refs.protocol.state.value === 'TCP') {
                refs.listener.setState({
                  data: tcpL,
                  value: (tcpL && tcpL[0]) ? tcpL[0].id : ''
                });
              } else {
                refs.listener.setState({
                  data: httpL,
                  value: (httpL && httpL[0]) ? httpL[0].id : ''
                });
              }
            }
            break;
          default:
            break;
        }

        let enableBtn = refs.protocol.state.value && refs.listener.state.value && refs.load_algorithm.state.value;
        refs.btn.setState({
          disabled: !enableBtn
        });
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
