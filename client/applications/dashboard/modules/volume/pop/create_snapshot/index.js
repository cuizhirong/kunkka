const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');
const priceConverter = require('../../../../utils/price');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name + '(' + obj.volume_type + ' | ' + obj.size + 'G' + ')';

  let enableCharge = HALO.settings.enable_charge;
  config.fields[3].hide = !enableCharge;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let type = 'snapshot.size';
      function setPrice() {
        let unitPrice = HALO.prices[type].unit_price.price.segmented[0].price;
        let volumeSize = obj.size;
        let price = Number(unitPrice * volumeSize).toFixed(4);

        refs.charge.setState({
          value: price
        });
      }

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
      let data = {};
      data.name = refs.snapshot_name.state.value;
      data.volume_id = obj.id;
      data.force = true;

      request.createSnapshot(data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs){
      switch (field) {
        case 'snapshot_name':
          refs.btn.setState({
            disabled: !status.value
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
