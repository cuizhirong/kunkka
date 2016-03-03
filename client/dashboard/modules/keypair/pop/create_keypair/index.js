var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(id, callback, parent) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.name.setState({
          value: 'Default'
        });
      }, 1000);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(filed, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
