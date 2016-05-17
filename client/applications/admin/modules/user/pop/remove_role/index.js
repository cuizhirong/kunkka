var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(type, obj, parent, callback) {
  config.fields[0].text = obj.rawItem.name;
  if (type === 'domain') {
    config.fields[1].text = '(' + obj.domain_id.substring(0, 8) + ')';
    config.fields[1].hide = false;
    config.fields[2].hide = true;
    config.fields[3].data = obj.childItem;
  } else {
    config.fields[1].hide = true;
    config.fields[2].hide = false;
    config.fields[2].text = '(' + obj.project_id.substring(0, 8) + ')';
    config.fields[3].data = obj.childItem;
  }
  config.fields[3].data[0].selected = true;
  config.btn.disabled = false;

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
      var domainId;
      if (type === 'domain') {
        domainId = obj.domain_id;
      } else {
        domainId = obj.project_id;
      }
      request.removeRole(type, obj.rawItem.id, roles, domainId).then(() => {
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
