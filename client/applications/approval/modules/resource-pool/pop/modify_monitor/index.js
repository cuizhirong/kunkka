var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.delay.setState({
        value: obj.healthmonitor.delay
      });
      refs.timeout.setState({
        value: obj.healthmonitor.timeout
      });
      refs.max_retries.setState({
        value: obj.healthmonitor.max_retries
      });
    },
    onConfirm: function(refs, cb) {
      var updateMonitor = {
        delay: refs.delay.state.value,
        timeout: refs.timeout.state.value,
        max_retries: refs.max_retries.state.value
      };

      request.updateMonitor(obj.healthmonitor.id, updateMonitor).then(r => {
        callback && callback();
        cb(true);
      }).catch(er => {
        cb(false, getErrorMessage(er));
      });
    },
    onAction: function(field, status, refs) {
      var delay = refs.delay.state,
        timeout = refs.timeout.state,
        retries = refs.max_retries.state,
        hmFilled = delay.value && timeout.value && retries.value && !delay.error && !timeout.error && !retries.error;
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

      if(hmFilled) {
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
