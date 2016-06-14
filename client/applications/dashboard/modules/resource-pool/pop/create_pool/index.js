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

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.protocol.setState({
        value: refs.protocol.state.data[0].name
      });
      refs.load_algorithm.setState({
        value: refs.load_algorithm.state.data[0].id
      });

      request.getListeners().then(res => {
        refs.listener.setState({
          data: res.listeners,
          value: res.listeners[0].id
        });

        if(refs.listener.state.value) {
          refs.btn.setState({
            disabled: false
          });
        }

      });
    },
    onConfirm: function(refs, cb) {
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
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'show_more':
          refs.health_monitor.setState({
            hide: !status.checked
          });
          refs.monitor_delay.setState({
            hide: !status.checked
          });
          refs.monitor_timeout.setState({
            hide: !status.checked
          });
          refs.monitor_max_retries.setState({
            hide: !status.checked
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
