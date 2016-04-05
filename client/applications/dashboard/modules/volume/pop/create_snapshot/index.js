var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name + '(' + obj.volume_type + ' | ' + obj.size + 'G' + ')';

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
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs){}
  };

  commonModal(props);
}

module.exports = pop;
