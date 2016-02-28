var commonModal = require('client/components/modal_common/index');
var __ = require('i18n/client/lang.json');
var config = require('./config.json');

function pop(callback, parent) {

  var props = {
    title: __[config.title],
    fields: config.fields,
    parent: parent,
    confirmText: __.confirm,
    cancelText: __.cancel,
    onConfirm: function(refs, cb) {
      setTimeout(function() {
        callback(refs);
        cb(true);
      }, 1000);
    },
    onAction: function(field, state, refs) {
      console.log(field, state, refs);
      switch(field) {
        case 'name':
          if (state.value === 'enabled') {
            refs.associate.setState({
              disabled: false
            });
          } else {
            refs.associate.setState({
              disabled: true
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
