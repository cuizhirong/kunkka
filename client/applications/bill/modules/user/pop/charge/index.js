const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/bill.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      let value = refs.charge.state.value;
      let data = {
        value: value,
        type: 'user',
        come_from: 'system'
      };
      request.charge(obj.id, data).then((res) => {
        cb(true);
      });
      request.getCharge(obj.id).then((res) => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'charge':
          let value = refs.charge.state.value.trim();
          let patrn = /^([1-9]\d*|0)(\.\d*[1-9])?$/;
          if (patrn.exec(value)) {
            refs.user_tip.setState({
              hide: true
            });
            refs.btn.setState({
              disabled: !status.value
            });
          } else if (value === '') {
            refs.user_tip.setState({
              hide: true
            });
          } else {
            refs.user_tip.setState({
              hide: false
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
