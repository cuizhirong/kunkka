const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

let externalNetwork = null;
const NAME = 'ratelimit.fip';

function pop(parent, callback) {

  let settings = HALO.settings;
  let enableBandwidth = settings.enable_floatingip_bandwidth;
  let enableCharge = settings.enable_charge;
  let defaultBandwidth = settings.max_floatingip_bandwidth;

  let tipField = config.fields[0];
  let bandwidthField = config.fields[1];
  let chargeField = config.fields[2];

  if (enableBandwidth) {
    if (defaultBandwidth) {
      bandwidthField.max = defaultBandwidth;
    }
    bandwidthField.hide = false;
    tipField.hide = true;
    if (enableCharge) {
      chargeField.hide = false;
    }
  } else {
    bandwidthField.hide = true;
    chargeField.hide = true;
    tipField.hide = false;
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if (enableCharge) {
        let bandwidth = config.fields[1].min;
        refs.charge.setState({
          value: HALO.prices ? (Math.max.apply(null, HALO.prices.other[NAME]) * bandwidth).toFixed(4) : 0
        });
      }

      request.getNetworks().then((networks) => {
        let floatingNetwork = networks.filter((item) => item['router:external']);

        if (floatingNetwork.length > 0) {
          externalNetwork = floatingNetwork;
          if(externalNetwork.length > 1) {
            refs.external_network.setState({
              data: externalNetwork,
              value: externalNetwork[0].id,
              hide: false
            });
          }
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
        let data = {}, limit = {fipratelimit: {}};
        data.floatingip = {};
        if(externalNetwork.length === 1) {
          data.floatingip.floating_network_id = externalNetwork[0].id;
        } else {
          data.floatingip.floating_network_id = refs.external_network.state.value;
        }

        if (enableBandwidth) {
          let bandwidth = Number(refs.bandwidth.state.value) * 1024 * 8;
          limit.fipratelimit.rate = bandwidth;
        }

        request.createFloatingIp(data).then((res) => {
          if (enableBandwidth) {
            limit.fipratelimit.floatingip_id = res.floatingip.id;
            limit.fipratelimit.floatingip_address = res.floatingip.floating_ip_address;
            request.createLimit(limit).then(r => {
              callback && callback(res.floatingip);
              cb(true);
            });
          } else {
            callback && callback(res.floatingip);
            cb(true);
          }
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'bandwidth':
          if (enableCharge) {
            let sliderEvent = state.eventType === 'mouseup';
            let inputEvnet = state.eventType === 'change' && !state.error;

            if (sliderEvent || inputEvnet) {
              refs.charge.setState({
                value: HALO.prices ? (Math.max.apply(null, HALO.prices.other[NAME]) * state.value).toFixed(4) : 0
              });
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
