var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, btnType, callback, parent) {
  config.fields[0].text = obj.rawItem.name;
  config.fields[1].data = btnType ? [obj.childItem] : obj.rawItem.volume;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      if(btnType) {
        request.detachVolume(obj).then((res) => {
          callback(res);
          cb(true);
        });
      } else {
        var dataArray = [];
        refs.volume.state.data.some((volume) => {
          if(volume.selected) {
            dataArray.push(volume);
          }
        });
        request.detachSomeVolume(obj.rawItem.id, dataArray).then((res) => {
          callback(res);
          cb(true);
        });
      }
    },
    onAction: function(field, state, refs) {

    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
