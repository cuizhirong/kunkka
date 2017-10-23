const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/bill.lang.json');
const stageInput = require('./stageInput.jsx');
const getErrorMessage = require('../../../../utils/error_message');

const regionList = HALO.region_list;

function pop(obj, parent, callback) {
  config.fields[4].data = regionList;
  if (obj) {
    config.title = ['modify', 'price'];
    config.fields[0].value = obj.name;
    config.fields[1].value = obj.unit_price.price.base_price;
    config.fields[3].value = obj.service;
    config.fields[4].value = obj.region_id;
    config.fields[5].value = obj.description;
    config.btn.value = 'modify';
  } else {
    config.title = ['create', 'price'];
    config.fields[0].value = '';
    config.fields[1].value = '';
    config.fields[4].value = HALO.current_region;
    config.fields[5].value = '';
    config.btn.value = 'create';
    config.btn.type = 'create';
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if(obj) {
        let price = obj.unit_price.price.segmented;
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
      let updateData = {
        name: refs.name.state.value,
        service: refs.service.state.value,
        region_id: refs.region.state.value,
        description: refs.description.state.value,
        unit_price: {
          price: {
            base_price: refs.base_price.state.value,
            type: 'segmented',
            segmented: refs.price.state.value
          }
        }
      };
      refs.btn.setState({
        disabled: true
      });
      if(obj) {
        request.updatePriceById(obj.id, updateData).then((res) => {
          callback && callback();
          cb(true);
        }).catch((error) => {
          refs.btn.setState({
            disabled: false
          });
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
          refs.btn.setState({
            disabled: false
          });
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, state, refs) {
      let disable = refs.name.state.error || refs.base_price.state.error || !refs.name.state.value || !refs.base_price.state.value;
      switch(field) {
        case 'name':
          let nameRegex = /^[a-zA-Z0-9_.:+-/\\\(\)\{\}]{1,}$/;
          refs.name.setState({
            error: !nameRegex.test(state.value)
          }, () => {
            refs.btn.setState({
              disabled: disable
            });
          });
          break;
        case 'base_price':
          let priceRegex = /^[0-9.]{1,}$/;
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
