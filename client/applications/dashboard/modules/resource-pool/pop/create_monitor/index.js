var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getList(false).then(res => {
        refs.resource_pool.setState({
          data: res,
          value: res[0].id
        });
      });
      refs.probe_type.setState({
        value: refs.probe_type.state.data[0].id
      });

    },
    onConfirm: function(refs, cb) {
      var monitorParam = {
        type: refs.probe_type.state.value,
        delay: refs.delay.state.value,
        timeout: refs.timeout.state.value,
        max_retries: refs.max_retries.state.value,
        pool_id: refs.resource_pool.state.value
      };

      request.createMonitor(monitorParam).then(res => {
        callback && callback();
        cb(true);
      }).catch(error => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      var delay = refs.delay.state,
        timeout = refs.timeout.state,
        retries = refs.max_retries.state,
        fullFilled = delay.value && timeout.value && retries.value && !delay.error && !timeout.error && !retries.error;
      switch(field) {
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

      if(fullFilled) {
        refs.btn.setState({
          disabled: false
        });
      } else {
        refs.btn.setState({
          disabled: true
        });
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
