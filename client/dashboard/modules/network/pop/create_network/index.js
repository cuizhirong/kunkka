var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {

    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'create_subnet':
          refs.subnet_name.setState({
            hide: !refs.create_subnet.state.checked
          });
          refs.net_address.setState({
            hide: !refs.create_subnet.state.checked
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
