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
    destroyPrevious: true,
    onInitialize: function(refs) {
      if(obj.detail) {
        refs.btn.setState({
          disabled: false
        });
      }
    },
    onConfirm: function(refs, cb) {
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
