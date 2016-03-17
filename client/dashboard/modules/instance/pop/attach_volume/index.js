var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.rawItem.name;
  config.fields[2].data = [];
  obj.volume.forEach((ele, i) => {
    var item = {
      id: i,
      name: ele.name
    };
    config.fields[2].data.push(item);
  });

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'volume':
          var selectedData = [];
          state.data.forEach((elem) => {
            if (elem.selected) {
              selectedData.push(elem.id);
            }
          });
          console.log(selectedData);
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
