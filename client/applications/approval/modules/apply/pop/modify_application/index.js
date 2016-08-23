var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');
var getErrorMessage = require('client/applications/approval/utils/error_message');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.apply_desc.setState({
        value: obj.description
      });
    },
    onConfirm: function(refs, cb) {
      var newDesc = refs.apply_desc.state.value;

      request.modifyApply(obj, newDesc).then(res => {
        callback && callback(res.floatingip);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
