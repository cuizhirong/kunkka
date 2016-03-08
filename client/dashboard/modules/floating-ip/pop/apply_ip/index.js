var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(callback, parent) {
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function(){
        refs.carrier.setState({
          data: [{
            id: 1,
            name: 'BGP'
          }]
        });
      }, 100);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'bandwidth':
          console.log(state);
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
