const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/approval/utils/error_message');

//let priceConverter = require('../../../../utils/price');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name + '(' + obj.volume_type + ' | ' + obj.size + 'G' + ')';

  let enableCharge = HALO.settings.enable_charge;
  config.fields[3].hide = !enableCharge;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      //let type = 'snapshot.size';
     /* function setPrice() {
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
      }*/
    },
    onConfirm: function(refs, cb) {
      let data = {};
      data.detail = {};
      let createDetail = data.detail;
      createDetail.type = 'direct';
      createDetail.resourceType = 'volumeSnapshot';
      createDetail.create = [];
      let configCreate = createDetail.create;
      let createItem = {};
      createItem = {
        _type: 'Snapshot',
        _identity: 'volSnap',
        name: refs.snapshot_name.state.value,
        volume_id: obj.id,
        force: 'true',
        metadata: {
          owner: HALO.user.username
        }
      };
      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;

      request.createApplication(data).then((res) => {
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
