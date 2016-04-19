var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.project.name;
  config.fields[1].text = obj.user.name;
  config.fields[2].data = obj.user.role;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var roles = [];
      refs.role.state.data.forEach(function(ele) {
        if (ele.selected) {
          roles.push(ele.id);
        }
      });
      request.removeUser(obj.project.id, obj.user.id, roles).then(() => {
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
