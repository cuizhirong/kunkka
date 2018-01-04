const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('../../request');

let gatewayId = null;
const NAME = 'ratelimit.gw';

function pop(obj, parent, callback, resize) {
  const enableCharge = HALO.settings.enable_charge;
  if(enableCharge) {
    config.fields[4].hide = false;
  } else {
    config.fields[4].hide = true;
  }
  let name = obj.name ? obj.name : '(' + obj.id.substr(0, 8) + ')';
  let enableBandwidth = HALO.settings.enable_floatingip_bandwidth;
  config.fields[0].info = __[config.fields[0].field].replace('{0}', name);
  config.fields[3].hide = !enableBandwidth;

  // 带宽限速调整
  if(resize) {
    config.title = ['gateway_limit'];
    config.fields[0].hide = true;
    config.fields[1].hide = true;
    config.fields[2].hide = true;
    config.btn.value = 'confirm';
  } else {
    config.title = ['enable', 'public_gateway'];
    config.fields[0].hide = false;
    config.fields[2].hide = false;
    config.btn.value = 'enable';
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      const bandwidth = refs.bandwidth.state.value;
      function setPrice(bw) {
        let price = HALO.prices ? ( Math.max.call(null, HALO.prices.other[NAME]) * bw ).toFixed(4) : 0;

        refs.charge.setState({
          value: price
        });
      }
      // 调整带宽限速
      if(resize && obj) {
        let rateLimit = obj.rate_limit ? Number(obj.rate_limit / (1024 * 8)) : 1;
        refs.bandwidth.setState({
          value: rateLimit,
          inputValue: rateLimit
        });
        setPrice(rateLimit);
      } else {
        if (enableCharge) {
          setPrice(bandwidth);
        }
      }
      request.getGateway().then((res) => {
        if(res.length > 0) {
          gatewayId = res[0].id;
          if(res.length > 1) {
            gatewayId = '';
            refs.external_network.setState({
              data: res,
              value: res[0].id,
              hide: false
            });
          }

          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        external_gateway_info: {
          network_id: gatewayId ? gatewayId : refs.external_network.state.value
        }
      };
      let limit = {
        gwratelimit: {
          rate: Number(refs.bandwidth.state.value) * 1024 * 8
        }
      };
      if(resize) {
        request.updateLimit(obj.id, limit).then(() => {
          callback && callback();
          cb(true);
        });
      } else {
        request.updateRouter(obj.id, data).then((res) => {
          if (enableBandwidth) {
            limit.gwratelimit.router_id = obj.id;
            request.createLimit(limit).then(() => {
              callback && callback(res.router);
              cb(true);
            });
          } else {
            callback && callback(res.router);
            cb(true);
          }
        });
      }
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'bandwidth':
          if (enableCharge) {
            let sliderEvent = state.eventType === 'mouseup';
            let inputEvnet = state.eventType === 'change' && !state.error;

            if (sliderEvent || inputEvnet) {
              refs.charge.setState({
                value: HALO.prices ? (Math.max.call(null, HALO.prices.other[NAME]) * state.value).toFixed(4) : 0
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
