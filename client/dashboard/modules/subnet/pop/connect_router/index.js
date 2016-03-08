var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.router.setState({
          data: [{
            id: 1,
            name: 'a1'
          }, {
            id: 2,
            name: 'a2'
          }]
        });
      }, 500);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
