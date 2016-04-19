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
      request.getAllUsers(obj.id).then((res) => {
        var currentUsers = res[0].users,
          allUsers = res[1].users;
        var users = [];
        allUsers.forEach((m) => {
          var hasUser = currentUsers.some((n) => {
            if (n.id === m.id) {
              return true;
            }
            return false;
          });
          if (!hasUser) {
            users.push(m);
          }
        });
        if (users.length > 0) {
          refs.user.setState({
            data: users
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var users = [];
      refs.user.state.data.forEach(function(ele) {
        if (ele.selected) {
          users.push(ele);
        }
      });

      request.addUser(obj.id, users).then((res) => {
        callback && callback(res);
        cb(true);
      }, () => {
        cb(false);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
