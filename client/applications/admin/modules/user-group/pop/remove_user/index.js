var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(groupData, parent, callback) {
  var group = groupData.rawItem,
    user = groupData.childItem;

  config.fields[0].text = group.name || group.id.slice(0, 8);
  config.fields[1].data = [user];
  config.fields[1].data[0].selected = true;
  config.btn.disabled = false;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.removeUser(group.id, user.id).then((res) => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'user':
          var btnState = refs.btn.state.disabled;
          refs.btn.setState({
            disabled: !btnState
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
