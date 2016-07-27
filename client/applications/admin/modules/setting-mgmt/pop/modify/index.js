var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop (obj, parent, callback) {
  config.fields[0].text = obj.name;
  config.fields[2].value = obj.description;

  var changeField = config.fields[1];
  changeField.value = obj.value.toString();
  if(obj.type === 'boolean') {
    changeField.type = 'tab';
    changeField.data = ['true', 'false'];
  } else if (obj.type === 'text') {
    changeField.type = 'textarea';
  } else {
    changeField.type = 'input';
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var newData = {
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
