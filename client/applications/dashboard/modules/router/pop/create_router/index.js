var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('../../../../utils/error_message');
var priceConverter = require('../../../../utils/price');

var gatewayId = null;
function pop(parent, callback) {

  var enableCharge = HALO.settings.enable_charge;
  config.fields[3].hide = !enableCharge;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      function setPrice() {
        var price = HALO.prices.router.unit_price.price.segmented[0].price;

        refs.charge.setState({
          value: price
        });
      }
      request.getGateway().then((res) => {
        if(res.length > 0) {
          refs.external_network.setState({
            data: res,
            value: res[0].id,
            hide: false
          });

          refs.btn.setState({
            disabled: false
          });
        }
      });

      if (HALO.settings.enable_charge) {
        if (!HALO.prices) {
          request.getPrices().then((res) => {
            HALO.prices = priceConverter(res);
            setPrice();
          }).catch((error) => {});
        } else {
          setPrice();
        }
      }
    },
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.name.state.value
      };
      if (refs.enable_public_gateway.state.checked) {
        data.external_gateway_info = {
          network_id: gatewayId ? gatewayId : refs.external_network.state.value
        };
      }
      request.createRouter(data).then((res) => {
        callback && callback(res.router);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'enable_public_gateway':
          if(refs.enable_public_gateway.state.checked && enableCharge) {
            refs.charge.setState({
              hide: false
            });
          } else {
            refs.charge.setState({
              hide: true
            });
          }
          if(refs.enable_public_gateway.state.checked) {
            refs.external_network.setState({
              hide: false
            });
          } else {
            refs.external_network.setState({
              hide: true
            });
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
