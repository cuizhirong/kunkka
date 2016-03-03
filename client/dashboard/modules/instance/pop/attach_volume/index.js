var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {

  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function(){
        refs.volume.setState({
          data: [{
            id: 1,
            name: '111'
          }, {
            id: 2,
            name: '222'
          }]
        });
      }, 500);
    },
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
