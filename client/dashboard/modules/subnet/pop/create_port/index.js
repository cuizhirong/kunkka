var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

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
  config.fields[3].data = data.sg.sort((a, b) => {
    if(a.name === 'default') {
      return -1;
    } else if(b.name === 'default') {
      return 1;
    } else {
      return 0;
    }
  });

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var port = {
        network_id: data.rawItem.network_id,
        name: refs.name.state.value,
        admin_state_up: true
      };
      request.addPort(port).then(() => {
        callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {

    }
  };

  commonModal(props);
}

module.exports = pop;
