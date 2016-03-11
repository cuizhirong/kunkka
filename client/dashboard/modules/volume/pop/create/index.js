var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  if (typeof obj === 'object') {
    config.fields[0].text = obj.name;
    config.fields[0].hide = false;
  }
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.capacity_size.setState({
          max: 300
        });
      }, 100);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
