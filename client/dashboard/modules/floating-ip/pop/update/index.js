var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  console.log(obj);
  config.fields[0].text = obj.name;
  //config.fields[1].value = obj.
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'bandwidth':
          console.log(state);
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
