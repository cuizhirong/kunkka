var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(id, callback, parent) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
