const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/approval.lang.json');
const getErrorMessage = require('client/applications/approval/utils/error_message');

function pop(data, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if(data) {
        refs.btn.setState({
          disabled: false
        });
      }
    },
    onConfirm: function(refs, cb) {
      let obj = {};
      obj.detail = {};
      obj.detail.resize = [];
      obj.detail.resize.push(data);
      obj.description = refs.apply_description.state.value;
      request.createApplication(obj).then(res => {
        callback && callback();
        cb(true);
      }).catch(err => {
        getErrorMessage(err);
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
