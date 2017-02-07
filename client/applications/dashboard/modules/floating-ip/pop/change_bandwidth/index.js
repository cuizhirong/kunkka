var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function priceError(refs, error) {
  refs.btn.setState({
    disabled: false
  });
}

function pop(obj, parent, callback) {

  var defaultBandwidth = HALO.settings.max_floatingip_bandwidth;
  if (defaultBandwidth) {
    config.fields[0].max = defaultBandwidth;
  }

  var currentBandwidth = obj.rate_limit / 1024;
  if (currentBandwidth < 1) {
    currentBandwidth = 1;
  }
  config.fields[0].value = currentBandwidth;

  var enableCharge = HALO.settings.enable_charge;
  config.btn.disabled = enableCharge;
  config.fields[1].hide = !enableCharge;

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

      if (enableCharge) {
        var bandwidth = currentBandwidth;
        request.getFloatingIPPrice(bandwidth).then((res) => {
          refs.charge.setState({
            value: res.unit_price
          });

          refs.btn.setState({
            disabled: false
          });
        }).catch(priceError.bind(this, refs));
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
          if (enableCharge) {
            var sliderEvent = state.eventType === 'mouseup';
            var inputEvnet = state.eventType === 'change' && !state.error;

            if (sliderEvent || inputEvnet) {
              request.getFloatingIPPrice(state.value).then((res) => {
                refs.charge.setState({
                  value: res.unit_price
                });
              }).catch(priceError.bind(this, refs));
            }
          }
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
