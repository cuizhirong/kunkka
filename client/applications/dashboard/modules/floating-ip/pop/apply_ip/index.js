var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

// function priceError(refs, error) {
//   refs.btn.setState({
//     disabled: false
//   });
// }

var externalNetwork = null;

function pop(parent, callback) {

  /*
  config: {
    "type": "slider",
    "field": "bandwidth",
    "min": 1,
    "max": 30,
    "value": 1,
    "unit": "Mbps"
  }, {
    "type": "charge",
    "field": "charge",
    "has_label": true
  }*/

  /*var defaultBandwidth = HALO.settings.max_floatingip_bandwidth;
  var slider = config.fields[0];
  if (defaultBandwidth) {
    slider.max = defaultBandwidth;
  }

  var enableCharge = HALO.settings.enable_charge;
  config.btn.disabled = enableCharge;
  config.fields[1].hide = !enableCharge;*/

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      /*if (HALO.settings.enable_charge) {
        var bandwidth = config.fields[0].min;
        request.getFloatingIPPrice(bandwidth).then((res) => {
          refs.charge.setState({
            value: res.unit_price
          });

          refs.btn.setState({
            disabled: false
          });
        }).catch(priceError.bind(this, refs));
      }*/

      request.getNetworks().then((networks) => {
        var floatingNetwork = networks.filter((item) => item['router:external']);

        if (floatingNetwork.length > 0) {
          externalNetwork = floatingNetwork[0];
        } else {
          refs.warning.setState({
            value: __.create_floatingip_error,
            hide: false
          });

          refs.btn.setState({
            disabled: true
          });
        }
      });

    },
    onConfirm: function(refs, cb) {
      if (externalNetwork) {
        let data = {};
        data.floatingip = {};
        data.floatingip.floating_network_id = externalNetwork.id;

        /*let bandwidth = Number(refs.bandwidth.state.value) * 1024;
        data.floatingip.rate_limit = bandwidth;*/

        request.createFloatingIp(data).then((res) => {
          callback && callback(res.floatingip);
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, state, refs) {
      switch (field) {
        /*case 'bandwidth':
          if (HALO.settings.enable_charge) {
            var sliderEvent = state.eventType === 'mouseup';
            var inputEvnet = state.eventType === 'change' && !state.error;

            if (sliderEvent || inputEvnet) {
              request.getFloatingIPPrice(state.value).then((res) => {
                refs.charge.setState({
                  value: res.unit_price
                });
              }).catch(priceError.bind(this, refs));
            }

            refs.btn.setState({
              disabled: state.error
            });
          }
          break;*/
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
