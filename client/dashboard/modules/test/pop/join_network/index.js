var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {

  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function(){
        refs.select_subnet.setState({
          data: [{
            name: 'group1',
            data: [{
              id: '1',
              name: '1.1.1.1'
            }, {
              id: '2',
              name: '2.2.2.2'
            }]
          }, {
            name: 'group2',
            data: [{
              id: '3',
              name: '3.3.3.3'
            }, {
              id: '4',
              name: '4.4.4.4'
            }]
          }],
          value: 3
        });
      }, 2000);
      setTimeout(function(){
        refs.select_interface.setState({
          data: [{
            id: 1,
            name: '3.3.3.3'
          }, {
            id: 2,
            name: '4.4.4.4'
          }],
          value: 1
        });
      }, 2000);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'select_subnet':
          refs.select_interface.setState({
            checkedField: state.checkedField
          });
          break;
        case 'select_interface':
          refs.select_subnet.setState({
            checkedField: state.checkedField
          });
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
