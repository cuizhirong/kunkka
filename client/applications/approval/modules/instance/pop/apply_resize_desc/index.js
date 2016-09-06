var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');
var getErrorMessage = require('client/applications/approval/utils/error_message');

function pop(data, parent, callback) {
  var props = {
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
      var obj = {};
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
