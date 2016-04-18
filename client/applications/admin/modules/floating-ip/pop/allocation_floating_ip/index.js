var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/admin.lang.json');

function pop(parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'bandwidth':
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
