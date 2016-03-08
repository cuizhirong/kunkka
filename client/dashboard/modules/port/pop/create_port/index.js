var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.subnet.setState({
          data: [{
            id: 1,
            name: '10.0.0.1'
          }, {
            id: 2,
            name: '10.0.0.2'
          }],
          value: 1
        });
        refs.security_group.setState({
          data: [{
            id: 1,
            name: '123',
            selected: true
          }, {
            id: 2,
            name: '2.2.2.2'
          }]
        });
      }, 1000);
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
