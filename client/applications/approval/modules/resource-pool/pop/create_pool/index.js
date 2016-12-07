var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');

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

  var getListenersUnderType = function(items) {
    var listeners = {};
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

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
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
    },
    onConfirm: function(refs, cb) {
      var data = {};
      data.description = refs.apply_description.state.value;
      data.detail = {};
      data.detail.create = [];
      data.detail.type = 'direct';
      data.detail.resourceType = 'resourcePool';
      var createDetail = data.detail.create;
      var poolParam = {
        _type: 'ResourcePool',
        _identity: 'pool',
        description: refs.desc.state.value,
        lb_algorithm: refs.load_algorithm.state.value.toUpperCase(),
        listener_id: refs.listener.state.value,
        name: refs.name.state.value,
        protocol: refs.protocol.state.value.toUpperCase()
      };
      createDetail.push(poolParam);

      request.createApplication(data).then(res => {
        callback && callback();
        cb(true);
      });
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
