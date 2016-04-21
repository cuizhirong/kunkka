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
      request.getGroups(obj.id).then((res) => {
        if (res.length > 0) {
          var defaultValue;
          res.some((g) => {
            if (!g.disabled) {
              defaultValue = g.id;
              return true;
            }
            return false;
          });
          if (defaultValue) {
            refs['user-group'].setState({
              data: res,
              value: defaultValue
            });
            refs.btn.setState({
              disabled: false
            });
          }
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.joinGroup(obj.id, refs['user-group'].state.value).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
