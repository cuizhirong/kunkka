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
      request.getRoles(obj).then((res) => {
        var allRoles = res[0].roles,
          currentRoles = res[1].roles,
          value;
        allRoles.forEach((m) => {
          var hasRole = currentRoles.some((n) => {
            if (n.id === m.id) {
              return true;
            }
            return false;
          });
          if (hasRole) {
            m.disabled = true;
          }
        });
        allRoles.some((role) => {
          if (!role.disabled) {
            value = role.id;
            return true;
          }
          return false;
        });
        if (allRoles.length > 0) {
          refs.role.setState({
            data: allRoles,
            value: value,
            hide: false
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.addRole(obj, refs.role.state.value).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
