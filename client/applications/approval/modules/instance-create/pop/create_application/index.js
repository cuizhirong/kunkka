const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/approval.lang.json');
const getErrorMessage = require('client/applications/approval/utils/error_message');
const utils = require('client/applications/approval/utils/utils');

function pop(obj, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if (obj.detail) {
        refs.btn.setState({
          disabled: false
        });
      }
    },
    onConfirm: function(refs, cb) {
      obj.usage = refs.apply_usage.state.value;
      obj.description = refs.apply_description.state.value;
      obj.detail.create.forEach(resource => {
        if (resource._type === 'Instance' || resource._type === 'Volume') {
          resource.metadata.usage = obj.usage;
        }
      });
      request.createApplication(obj).then(res => {
        callback && callback(res);
        cb(true);
      }).catch(err => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'apply_usage':
          let usage = refs.apply_usage.state.value;
          let usageUTF8Length = utils.getStringUTF8Length(usage);
          if (usageUTF8Length > 255 || usageUTF8Length === 0) {
            refs.btn.setState({
              disabled: true
            });
            refs.apply_usage.setState({
              error: true
            });
          } else {
            refs.btn.setState({
              disabled: false
            });
            refs.apply_usage.setState({
              error: false
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
