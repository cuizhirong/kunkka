const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/bill.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  // 从暂存中拿到所有的services
  let services = HALO.stash.services.map(s => {
    return {
      name: s.name,
      id: s.service_id,
      service_id: s.service_id
    };
  });
  // 从services中拿到compute和volume.volume
  let compute = services.find(s => s.name === 'compute');
  let volume = services.find(s => s.name === 'volume.volume');
  let mappings = HALO.stash.mappings;
  // 将暂存中的flavors和volumeTypes转换成select_single可显示的结构
  let flavors = HALO.stash.flavors.map(f => {
    let disable = !!mappings.find(m => m.value === f.id);
    return {
      name: f.name + (disable ? `   [${__.price_exist}]` : ''),
      id: f.id,
      disabled: disable
    };
  });
  let volumeTypes = HALO.stash.volume_types.map(f => {
    let disable = !!mappings.find(m => m.value === f.id);
    return {
      name: f.name + (disable ? `   [${__.price_exist}]` : ''),
      id: f.id,
      disabled: disable
    };
  });
  // 根据compute或volume.volume给fieldId赋不同的值
  let fieldId;
  if(services[0].name === 'compute') {
    fieldId = HALO.stash.flavor_id;
  } else if(services[0].name === 'volume.volume') {
    fieldId = HALO.stash.volume_type;
  }

  // 修改价格，只需要显示价格输入即可，fieldId, mapping两者即可修改
  if (obj) {
    config.fields[0].hide = true;
    config.fields[1].hide = true;
    config.fields[2].value = obj.cost;
    config.btn.value = 'modify';
    config.btn.disabled = false;
    config.title = ['modify', 'price'];
  } else { // 创建价格
    config.fields[0].hide = false;
    config.fields[0].data = services;
    // 初始化的时候，判断是compute还是volume.volume，显示不同的fields选择
    if(services[0].name === 'compute') {
      config.fields[1].hide = false;
      config.fields[1].data = flavors;
    } else if(services[0].name === 'volume.volume') {
      config.fields[1].hide = false;
      config.fields[1].data = volumeTypes;
    }
    config.fields[0].value = services[0].id;
    config.fields[2].value = '';
    config.btn.value = 'create';
    config.btn.disabled = true;
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
      // 创建价格
      if(!obj) {
        // 如果是compute或者volume.volume，需要传入field_id，其他类型的mapping不需要
        if(refs.service.state.value === compute.service_id || refs.service.state.value === volume.service_id) {
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
      } else { // 修改价格
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
      let serviceId = refs.service.state.value;
      let disabled = false;
      if(!obj) {
        if(compute.id === serviceId || volume.id === serviceId) {
          disabled = !(price && regNumber.test(price) && flavor);
        } else {
          disabled = !(price && regNumber.test(price));
        }
      } else {
        disabled = !(price && regNumber.test(price));
      }
      switch(field) {
        case 'service':
          let com = compute.service_id === state.value;
          let vol = volume.service_id === state.value;
          let data = [];
          if(com) {
            data = flavors;
            fieldId = HALO.stash.flavor_id;
          } else if(vol) {
            data = volumeTypes;
            fieldId = HALO.stash.volume_type;
          }
          refs.flavor.setState({
            data: data,
            hide: !(com || vol)
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
