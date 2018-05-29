const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');

const getErrorMessage = require('client/applications/approval/utils/error_message');

function pop(obj, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.apply_desc.setState({
        value: obj.description
      });
    },
    onConfirm: function(refs, cb) {
      let newDesc = refs.apply_desc.state.value;

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
