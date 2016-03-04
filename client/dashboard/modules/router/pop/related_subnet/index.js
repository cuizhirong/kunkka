var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.router;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.subnet.setState({
          data: [{
            id: 1,
            name: '3.3.3.3'
          }, {
            id: 2,
            name: '4.4.4.4'
          }],
          value: 2
        });
      }, 1000);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
