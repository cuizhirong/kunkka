var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.rawItem.name;
  config.fields[2].data = [];
  obj.volume.forEach((ele, i) => {
    var item = {
      id: i,
      volumeId: ele.id,
      name: ele.name
    };
    config.fields[2].data.push(item);
  });

  var selectedVolume = {};
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.attachVolume(obj.rawItem, selectedVolume).then(() => {
        callback();
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'volume':
          state.data.forEach((elem) => {
            if (elem.selected) {
              selectedVolume.index = elem.id;
              selectedVolume.volumeId = elem.volumeId;
            }
            elem.selected = false;
          });
          break;
        case 'type':
          console.log(state.value);
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
