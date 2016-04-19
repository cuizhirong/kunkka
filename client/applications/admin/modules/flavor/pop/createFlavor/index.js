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
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {

    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
