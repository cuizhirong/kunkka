var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      var data = [];

      obj.attachments.forEach((ele) => {
        data.push({
          id: ele.server.id,
          attachmentId: ele.id,
          name: ele.server.name
        });
      });

      if (data[0]) {
        data[0].selected = true;
      }
      refs.instance.setState({
        data: data
      });
    },
    onConfirm: function(refs, cb) {
      var selected = refs.instance.state.data.filter((ele) => ele.selected)[0];

      request.detachInstance({
        attachmentId: selected.attachmentId,
        serverId: selected.id
      }).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs){
      switch (field) {
        case 'instance':
          refs.btn.setState({
            disabled: !status.value
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
