var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.addUser(obj.id, refs.user_id.state.value).then((res) => {
        callback && callback(res);
        cb(true);
      }, () => {
        cb(false);
      });
    },
    onAction: function(field, status, refs) {
      if(refs.user_id.state.value) {
        refs.btn.setState({
          disabled: false
        });
      } else {
        refs.btn.setState({
          disabled: true
        });
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
