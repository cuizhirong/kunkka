var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(callback, parent) {

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
        case 'enable_gw':
          refs.gw_address.setState({
            disabled: !refs.enable_gw.state.checked
          });
          break;
        case 'show_more':
          refs.enable_gw.setState({
            hide: !refs.show_more.state.checked
          });
          refs.gw_address.setState({
            hide: !refs.show_more.state.checked
          });
          refs.enable_dhcp.setState({
            hide: !refs.show_more.state.checked
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
