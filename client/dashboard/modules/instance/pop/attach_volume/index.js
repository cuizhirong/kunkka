var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.rawItem.name;
  config.fields[2].data = [];
  obj.volumes.forEach((ele) => {
    var hasVolume = obj.rawItem.volume.some((v) => {
      if (v.id === ele.id) {
        return true;
      }
      return false;
    });
    if (!hasVolume) {
      config.fields[2].data.push(ele);
    }
  });

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.attachVolume(obj.rawItem, refs.volume.state.value).then(() => {
        callback();
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'volume':
          refs.btn.setState({
            disabled: !state.value
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
