var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(callback, parent) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.name.setState({
          value: 'default'
        });
      }, 1000);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'router':
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
