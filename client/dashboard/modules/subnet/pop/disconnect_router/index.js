var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[1].text = obj.name;
  config.fields[2].text = obj.router.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      request.disconnectRouter(obj.router.id, {
        subnet_id: obj.id
      }).then((res) => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
