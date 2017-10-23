const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(type, obj, parent, callback) {
  config.fields[0].text = obj.name;
  if (type === 'domain') {
    config.fields[1].hide = false;
    config.fields[2].hide = true;
  } else {
    config.fields[1].hide = true;
    config.fields[2].hide = false;
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getRoles().then((res) => {
        let roles = res.roles;
        if (roles.length > 0) {
          refs.role.setState({
            data: roles,
            value: roles[0].id,
            hide: false
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.addRole(type, obj, refs.role.state.value, refs[type].state.value).then(() => {
        callback && callback();
        cb(true);
      }).catch(() => {
        cb(false);
        refs[type].setState({
          error: true
        });
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
