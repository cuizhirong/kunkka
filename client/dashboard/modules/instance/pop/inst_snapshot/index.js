var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {

  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      var snapshot = {
        name: refs.inst_snapshot_name.state.value,
        metadata: {
          meta_var: 'meta_val'
        }
      };
      request.createSnapshot(snapshot, obj).then(() => {
        callback();
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
