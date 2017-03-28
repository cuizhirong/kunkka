var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.btn.disabled = true;
  config.fields[0].text = obj.project.name;
  config.fields[1].text = obj.user_group.name;
  config.fields[2].data = obj.user_group.roles;
  for(let i = 0; i < obj.user_group.roles.length; i++) {
    config.fields[2].data[i].selected = true;
    config.btn.disabled = false;
  }
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let roles = [];
      refs.role.state.data.forEach(ele => {
        if (ele.selected) {
          roles.push(ele.id);
        }
      });
      request.removeUserGroup(obj.project.id, obj.user_group.id, roles).then(res => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'role':
          var hasRole = status.data.some((item) => {
            if (item.selected) {
              return true;
            }
            return false;
          });
          refs.btn.setState({
            disabled: !hasRole
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
