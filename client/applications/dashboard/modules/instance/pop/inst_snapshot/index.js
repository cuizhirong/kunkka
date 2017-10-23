const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const priceConverter = require('../../../../utils/price');

function pop(obj, parent, callback) {

  config.fields[0].text = obj.name;

  let enableCharge = HALO.settings.enable_charge;
  config.fields[2].hide = !enableCharge;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      function setPrice() {
        let unitPrice = HALO.prices['snapshot.size'].unit_price.price.segmented[0].price;
        let imgSize = obj.image.size / 1024 / 1024 / 1024;
        let price = Number(unitPrice * imgSize).toFixed(4);

        refs.charge.setState({
          value: price
        });
      }

      if (enableCharge) {
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
      let snapshot = {
        name: refs.inst_snapshot_name.state.value,
        metadata: {
          meta_var: 'meta_val'
        }
      };
      request.createSnapshot(snapshot, obj).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {

    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
