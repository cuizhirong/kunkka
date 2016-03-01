var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {

  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function(){
        refs.keypair.setState({
          data: [{
            id: 1,
            name: '123',
            selected: true
          }, {
            id: 2,
            name: '2.2.2.2'
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
        case 'keypair':
          var selectedData = [];
          state.data.forEach((elem) => {
            if (elem.selected) {
              selectedData.push(elem.id);
            }
          });
          console.log(selectedData);
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
