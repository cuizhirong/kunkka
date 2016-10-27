var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');
//var priceConverter = require('../../../../utils/price');

function pop(obj, parent, callback) {

  config.fields[0].text = obj.name;

  var enableCharge = HALO.settings.enable_charge;
  config.fields[2].hide = !enableCharge;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      /*function setPrice() {
        var unitPrice = HALO.prices['snapshot.size'].unit_price.price.segmented[0].price;
        var imgSize = obj.image.size / 1024 / 1024 / 1024;
        var price = Number(unitPrice * imgSize).toFixed(4);

        refs.charge.setState({
          value: price
        });
      }*/

      /*if (enableCharge) {
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
      createDetail.resourceType = 'instanceSnapshot';
      createDetail.create = [];
      var configCreate = createDetail.create;
      var createItem = {};
      createItem = {
        _type: 'Snapshot',
        _identity: 'instSnap',
        instanceId: obj.id,
        name: refs.inst_snapshot_name.state.value,
        metadata: {
          meta_owner: HALO.user.username
        }
      };
      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;
      request.createApplication(data).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      var instSnapshotName = refs.inst_snapshot_name.state;
      switch (field) {
        case 'inst_snapshot_name':
          if(instSnapshotName.error === true && instSnapshotName.value === '') {
            refs.inst_snapshot_name.setState({
              error: false
            });
          }
          break;
        default:
          break;
      }

      refs.btn.setState({
        disabled: !(!instSnapshotName.error && instSnapshotName.value)
      });

    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
