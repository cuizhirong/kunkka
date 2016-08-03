var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getStatusIcon = require('../../../../utils/status_icon');

function pop(obj, parent, callback) {

  config.fields[0].data = obj;
  config.fields[0].getStatusIcon = getStatusIcon;

  var hasActive = obj.some((ele) => ele.status.toLowerCase() === 'active');
  config.fields[1].hide = !hasActive;
  config.btn.disabled = hasActive;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.deleteItem(obj).then((res) => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'delete_instance_tip':
          refs.btn.setState({
            disabled: !state.checked
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
