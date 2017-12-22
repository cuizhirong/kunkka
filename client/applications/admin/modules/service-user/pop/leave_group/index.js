const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(userData, parent, callback) {
  let user = userData.rawItem,
    group = userData.childItem;

  config.fields[0].text = user.name || user.id.slice(0, 8);
  config.fields[1].data = [group];
  config.fields[1].data[0].selected = true;
  config.btn.disabled = false;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.leaveGroup(user.id, group.id).then((res) => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'user-group':
          let btnState = refs.btn.state.disabled;
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
