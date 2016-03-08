var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  config.fields[0].value = obj.subnet;
  config.fields[2].value = obj.address;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {
      switch(field){
        case 'enable_gw':
          refs.gw_address.setState({
            disabled: true
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
