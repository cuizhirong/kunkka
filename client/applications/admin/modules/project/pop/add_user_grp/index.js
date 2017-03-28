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
    onInitialize: function(refs) {
      request.getRoles().then(res => {
        var roles = res.roles;
        if (roles.length > 0) {
          refs.role.setState({
            data: roles,
            hide: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let roles = [];
      refs.role.state.data.forEach(ele => {
        if (ele.selected) {
          roles.push(ele.id);
        }
      });
      if (roles[0]) {
        request.addUserGroup(obj.id, refs.user_grp_id.state.value, roles).then(res => {
          callback && callback(res);
          cb(true);
        });
      }
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'user_grp_id':
          if (refs.role.state.value) {
            refs.btn.setState({
              disabled: !refs.user_grp_id.state.value
            });
          }
          break;
        case 'role':
          var hasRole = status.data.some(item => {
            if (item.selected) {
              return true;
            }
            return false;
          });
          if (refs.user_grp_id.state.value) {
            refs.btn.setState({
              disabled: !hasRole
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
