var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(callback, parent) {

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.name && refs.name.setState({
          value: 'default value 2'
        });
      }, 2000);
    },
    onConfirm: function(refs, cb) {
      setTimeout(function() {
        callback(refs);
        cb(true);
      }, 1000);
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'name':
          console.log('onAction: ', state.value);
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
