var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var priceConverter = require('../../../../utils/price');

function pop(obj, parent, callback) {

  config.fields[0].text = obj.name;

  var enableCharge = HALO.settings.enable_charge;
  config.fields[2].hide = !enableCharge;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      function setPrice() {
        var unitPrice = HALO.prices['snapshot.size'].unit_price.price.segmented[0].price;
        var imgSize = obj.image.size / 1024 / 1024 / 1024;
        var price = Number(unitPrice * imgSize).toFixed(4);

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
      var snapshot = {
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
