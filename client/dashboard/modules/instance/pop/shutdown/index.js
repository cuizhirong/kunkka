var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('../../request');

function pop(obj, callback, parent) {

  config.fields[0].info = __[config.fields[0].field].replace('{0}', obj.name);

  var props = {
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      var forceShutdown = refs.is_force_shutdown.state.checked;
      request.poweroff(obj, forceShutdown).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
