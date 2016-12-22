var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/bill.lang.json');
var stageInput = require('./stageInput.jsx');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  if (obj) {
    config.title = ['modify', 'price'];
    config.fields[0].value = obj.name;
    config.fields[1].value = obj.unit_price.price.base_price;
    config.fields[3].value = obj.service;
    config.fields[4].value = obj.description;
    config.btn.value = 'modify';
    config.btn.type = 'update';
  } else {
    config.title = ['create', 'price'];
    config.fields[0].value = '';
    config.fields[1].value = '';
    config.fields[4].value = '';
    config.btn.value = 'create';
    config.btn.type = 'create';
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if(obj) {
        var price = obj.unit_price.price.segmented;
        refs.price.setState({
          renderer: stageInput,
          value: price
        });
        refs.btn.setState({
          disabled: false
        });
      } else {
        refs.price.setState({
          renderer: stageInput,
          value: []
        });
      }
    },
    onConfirm: function(refs, cb) {
      var updateData = {
        name: refs.name.state.value,
        service: refs.service.state.value,
        region_id: HALO.current_region,
        description: refs.description.state.value,
        unit_price: {
          price: {
            base_price: refs.base_price.state.value,
            type: 'segmented',
            segmented: refs.price.state.value
          }
        }
      };
      if(obj) {
        request.updatePriceById(obj.id, updateData).then((res) => {
          callback && callback();
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage('error'));
        });
      } else {
        if(refs.price.state.value.length === 0) {
          updateData.unit_price.price.segmented = [{count: 0, price: 0}];
        }
        request.addPrice(updateData).then((res) => {
          callback && callback();
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, state, refs) {
      var disable = refs.name.state.error || refs.base_price.state.error || !refs.name.state.value || !refs.base_price.state.value;
      switch(field) {
        case 'name':
          var nameRegex = /^[a-zA-Z0-9_.:+]{1,}$/;
          refs.name.setState({
            error: !nameRegex.test(state.value)
          }, () => {
            refs.btn.setState({
              disabled: disable
            });
          });
          break;
        case 'base_price':
          var priceRegex = /^[0-9.]{1,}$/;
          refs.base_price.setState({
            error: !priceRegex.test(state.value)
          }, () => {
            refs.btn.setState({
              disabled: disable
            });
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
