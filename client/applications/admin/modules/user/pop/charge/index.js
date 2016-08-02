var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      var value = refs.charge.state.value;
      var data = {
        value: value
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
          var value = refs.charge.state.value.trim();
          var patrn = /^([1-9]\d*|0)(\.\d*[1-9])?$/;
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
