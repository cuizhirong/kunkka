var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].info = __[config.fields[0].field].replace('{0}', obj.name);

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      request.setReadOnly(obj).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs){}
  };

  commonModal(props);
}

module.exports = pop;
