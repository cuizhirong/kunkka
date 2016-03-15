var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getList().then((data) => {
        refs.instance.setState({
          data: data.instance,
          value: data.instance[0].id
        });
      });
    },
    onConfirm: function(refs, cb) {
      request.addInstance(refs.instance.state.value, obj.id, obj.network_id);
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
