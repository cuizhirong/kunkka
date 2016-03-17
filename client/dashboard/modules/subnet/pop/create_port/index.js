var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(data, callback, parent) {
  config.fields[1].data = [];
  config.fields[1].data.push({
    value: 0,
    name: data.rawItem.network.name,
    data: [{
      id: 0,
      name: data.rawItem.name
    }]
  });
  config.fields[3].data = data.sg;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {

    }
  };

  commonModal(props);
}

module.exports = pop;
