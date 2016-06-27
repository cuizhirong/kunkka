var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('../../../../utils/error_message');
// var priceConverter = require('../../../../utils/price');

var gatewayId = null;
function pop(parent, callback) {

  // var enableCharge = HALO.settings.enable_charge;
  // config.fields[2].hide = !enableCharge;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      // config:{
      //   "type": "charge",
      //   "field": "charge",
      //   "has_label": true
      // }
      // function setPrice() {
      //   var price = HALO.prices.router.unit_price.price.segmented[0].price;

      //   refs.charge.setState({
      //     value: price
      //   });
      // }

      request.getGateway().then((res) => {
        gatewayId = res;
        refs.btn.setState({
          disabled: false
        });
      });

      // if (HALO.settings.enable_charge) {
      //   if (!HALO.prices) {
      //     request.getPrices().then((res) => {
      //       HALO.prices = priceConverter(res);
      //       setPrice();
      //     }).catch((error) => {});
      //   } else {
      //     setPrice();
      //   }
      // }
    },
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.name.state.value
      };
      if (refs.enable_public_gateway.state.checked) {
        data.external_gateway_info = {
          network_id: gatewayId
        };
      }
      request.createRouter(data).then((res) => {
        callback && callback(res.router);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
