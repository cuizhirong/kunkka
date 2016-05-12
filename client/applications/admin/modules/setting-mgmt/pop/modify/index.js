var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop (obj, parent, callback) {
  config.fields[0].value = obj.name;
  config.fields[1].value = obj.value;
  config.fields[2].value = obj.description;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var newData = {
        name: refs.name.state.value,
        value: refs.value.state.value,
        description: refs.describe.state.value
      };
      request.editConfig(obj.id, newData).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'name':
          refs.btn.setState({
            disabled: !status.value
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
