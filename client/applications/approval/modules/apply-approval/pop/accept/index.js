const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/approval.lang.json');
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
      request.acceptApply(obj).then(res => {
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
