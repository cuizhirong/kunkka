const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/bill.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;
  config.fields[1].data = [{
    name: __.system,
    id: 'system'
  }, {
    name: __.bonus,
    id: 'bonus'
  }];
  config.fields[1].value = {
    name: __.system,
    id: 'system'
  };

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      const chargeType = refs.charge_type.state.value;
      let value = refs.charge_value.state.value;
      let data = {
        value: value
      };
      if(chargeType && chargeType.id === 'bonus') {
        data.type = 'bonus';
        data.come_from = 'system';
      } else if(chargeType && chargeType.id === 'system') {
        data.type = 'money';
        data.come_from = 'system';
      }
      request.charge(obj.id, data).then((res) => {
        cb(true);
        callback && callback(data, obj.name);
      }).catch(err => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'charge_value':
          let value = status.value.trim();
          let patrn = /^([1-9]\d*|0)(\.\d*[1-9])?$/;
          if (patrn.test(value)) {
            refs.user_tip.setState({
              hide: true
            });
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.user_tip.setState({
              hide: false
            });
            refs.btn.setState({
              disabled: true
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
