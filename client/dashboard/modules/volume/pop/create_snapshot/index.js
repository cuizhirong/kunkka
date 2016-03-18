var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name + '(' + obj.volume_type + ' | ' + obj.size + 'G' + ')';

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      var data = {};
      data.name = refs.snapshot_name.state.value;
      data.volume_id = obj.id;

      request.createSnapshot(data).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs){}
  };

  commonModal(props);
}

module.exports = pop;
