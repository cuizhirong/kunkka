var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.instance.setState({
          data: [{
            id: 1,
            name: '1.1.1.1'
          }, {
            id: 2,
            name: '2.2.2.2'
          }],
          value: 1
        });
      }, 1000);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'instance':
          console.log(field);
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
