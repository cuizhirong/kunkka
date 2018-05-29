const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');

const getErrorMessage = require('client/applications/approval/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.id;
  config.fields[1].text = obj.description;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let text = refs.refuse_explain.state.value;

      request.refuseApply(obj, text).then(res => {
        callback && callback();
        cb(true);
      }).catch(err => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
