var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');

function pop(obj, callback, parent) {

  config.fields[0].info = __[config.fields[0].field].replace('{0}', obj.name);

  var props = {
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'checkbox':
          refs.warning_tip.setState({
            hide: true
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
