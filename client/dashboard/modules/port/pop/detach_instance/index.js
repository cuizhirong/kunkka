var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[1].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  config.fields[2].text = obj.server.name;

  var props = {
    parent: parent,
    config: config,

    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      var serverId = obj.server.id,
        portId = obj.id;

      request.detchInstance(serverId, portId).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
