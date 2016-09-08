var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/approval/utils/error_message');
var __ = require('locale/client/approval.lang.json');
//var priceConverter = require('../../../../utils/price');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name + '(' + obj.volume_type + ' | ' + obj.size + 'G' + ')';

  var enableCharge = HALO.settings.enable_charge;
  config.fields[3].hide = !enableCharge;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      //var type = 'snapshot.size';
     /* function setPrice() {
        var unitPrice = HALO.prices[type].unit_price.price.segmented[0].price;
        var volumeSize = obj.size;
        var price = Number(unitPrice * volumeSize).toFixed(4);

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
      }*/
    },
    onConfirm: function(refs, cb) {
      var data = {};
      data.detail = {};
      var createDetail = data.detail;
      createDetail.type = 'direct';
      createDetail.resourceType = 'volumeSnapshot';
      createDetail.create = [];
      var configCreate = createDetail.create;
      var createItem = {};
      createItem = {
        _type: 'Snapshot',
        _identity: 'volSnap',
        name: refs.snapshot_name.state.value,
        volume_id: obj.id,
        force: 'true'
      };
      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;

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
