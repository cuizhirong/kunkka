var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {

  var defaultBandwidth = HALO.settings.max_floatingip_bandwidth;
  if (defaultBandwidth) {
    config.fields[0].max = defaultBandwidth;
  }

  var currentBandwidth = obj.rate_limit / 1024;
  config.fields[0].value = currentBandwidth;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if (currentBandwidth > defaultBandwidth) {
        refs.bandwidth.setState({
          error: true
        });
        refs.btn.setState({
          disabled: true
        });
      }
    },
    onConfirm: function(refs, cb) {
      var bw = Number(refs.bandwidth.state.value) * 1024;
      var data = {
        floatingip: {
          rate_limit: bw
        }
      };

      request.changeBandwidth(obj.id, data).then((res) => {
        cb(true);
        callback && callback(res);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'bandwidth':
          refs.btn.setState({
            disabled: state.error
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
