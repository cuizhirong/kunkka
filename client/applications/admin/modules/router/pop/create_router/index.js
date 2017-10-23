const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');
const priceConverter = require('../../../../utils/price');

let gatewayId = null;
function pop(parent, callback) {

  let enableCharge = HALO.settings.enable_charge;
  config.fields[4].hide = !enableCharge;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      function setPrice() {
        let price = HALO.prices.router.unit_price.price.segmented[0].price;

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
        } else {
          refs.enable_public_gateway.setState({
            checked: false,
            hide: true
          });
        }

        refs.btn.setState({
          disabled: true
        });
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
      let data = {
        name: refs.name.state.value,
        project_id: refs.project_id.state.value
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
      let projectId = refs.project_id.state.value;
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
          if(refs.external_network.state.value.length && projectId !== '') {
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.btn.setState({
              disabled: true
            });
          }
          break;
        case 'project_id':
          if(refs.external_network.state.value.length && projectId !== '') {
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.btn.setState({
              disabled: true
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
