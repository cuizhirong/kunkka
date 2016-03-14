var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].value = obj.name;
  config.fields[1].value = obj.description;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var newData = {
        name: refs.name.state.value,
        description: refs.desc.state.value
      };
      request.editSecurityGroup(obj, newData).then(() => {
        callback();
      });
      cb(true);
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
