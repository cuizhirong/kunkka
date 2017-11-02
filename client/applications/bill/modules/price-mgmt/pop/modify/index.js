const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/bill.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  let services = HALO.stash.services.map(s => {
    return {
      name: s.name,
      id: s.service_id,
      service_id: s.service_id
    };
  });
  let fieldId = HALO.stash.field_id;
  let compute = services.find(s => s.name === 'compute');
  let mappings = HALO.stash.mappings;
  let flavors = HALO.stash.flavors.map(f => {
    let disable = !!mappings.find(m => m.value === f.id);
    return {
      name: f.name + (disable ? `   [${__.price_exist}]` : ''),
      id: f.id,
      disabled: disable
    };
  });
  if (obj) {
    config.fields[0].hide = true;
    config.fields[2].value = obj.cost;
    config.btn.value = 'modify';
    config.title = ['modify', 'price'];
  } else {
    config.fields[0].hide = false;
    config.fields[0].data = services;
    config.fields[0].value = services[0].id;
    config.fields[1].data = flavors;
    config.fields[2].value = '';
    config.btn.value = 'create';
    config.title = ['create', 'price'];
  }
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      let data = {
        type: 'flat',
        cost: refs.price.state.value
      };
      if(!obj) {
        if(refs.service.state.value === compute.service_id) {
          data.field_id = fieldId;
          data.value = refs.flavor.state.value.id;
        } else {
          data.service_id = refs.service.state.value;
        }
        request.createMapping(data).then(res => {
          callback && callback();
          cb(true);
        }).catch(err => {
          cb(false, getErrorMessage(err));
        });
      } else {
        let d = {
          cost: refs.price.state.value
        };
        if(obj.field_id) {
          d.value = fieldId;
        }
        request.updateMapping(obj.mapping_id, d).then(() => {
          callback && callback();
          cb(true);
        }).catch(err => {
          callback && callback();
          cb(true);
        });
      }
    },
    onAction: function(field, state, refs) {
      let regNumber = /^([1-9]\d*|0)(\.\d+)?$/;
      let price = refs.price.state.value;
      let flavor = refs.flavor.state.value;
      let disabled = true;
      if(compute.id === refs.service.state.value) {
        disabled = !(price && regNumber.test(price) && flavor);
      } else {
        disabled = !(price && regNumber.test(price));
      }
      switch(field) {
        case 'service':
          refs.flavor.setState({
            hide: !(compute.service_id === state.value)
          });
          refs.btn.setState({
            disabled: disabled
          });
          break;
        case 'flavor':
          refs.btn.setState({
            disabled: disabled
          });
          break;
        case 'price':
          refs.price.setState({
            error: !regNumber.test(price)
          });
          refs.btn.setState({
            disabled: disabled
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
