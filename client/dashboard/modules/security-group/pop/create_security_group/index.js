var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(parent, callback) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        name: refs.name.state.value,
        description: refs.desc.state.value
      };
      request.addSecurityGroup(data).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(filed, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
