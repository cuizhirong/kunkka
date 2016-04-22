var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      var data = {
        flavor: {
          name: refs.name.state.value,
          ram: Number(refs.memory.state.value),
          vcpus: Number(refs.vcpu.state.value),
          disk: Number(refs.capacity.state.value),
          'OS-FLV-DISABLED:disabled': refs.set_enable.state.value
        }
      };
      request.createFlavor(data).then((res) => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'name':
          var regex = /^[a-zA-Z0-9_]{1,}$/;
          if(regex.exec(state.value)) {
            refs.name.setState({
              error: false
            });
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.name.setState({
              error: true
            });
            refs.btn.setState({
              disabled: true
            });
          }
          break;
        default:
          break;
      }
    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
