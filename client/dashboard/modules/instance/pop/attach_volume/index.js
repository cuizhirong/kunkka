var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.rawItem.name;
  config.fields[2].data = [];
  obj.rawItem.volume.forEach((ele, i) => {
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
    onInitialize: function(refs) {
      request.getVolumeList().then((data) => {
        var dataArray = [];
        data.some((volume) => {
          if(volume.status === 'available') {
            dataArray.push(volume);
          }
        });
        refs.volume.setState({
          data: dataArray,
          value: dataArray[0].id
        });
        refs.btn.setState({
          disabled: false
        });
      });
    },
    onConfirm: function(refs, cb) {
      request.attachVolume(obj.rawItem, selectedVolume).then(() => {
        callback();
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'volume':
          state.data.some((elem) => {
            if (elem.selected) {
              selectedVolume.volumeId = elem.id;
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
