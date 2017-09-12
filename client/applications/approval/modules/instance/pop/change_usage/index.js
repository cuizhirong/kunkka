const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('../../../../utils/error_message');
const utils = require('../../../../utils/utils');
const __ = require('locale/client/approval.lang.json');

function pop(obj, parent, callback) {

  config.fields[0].value = obj.metadata.usage ? obj.metadata.usage : '';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let length = utils.getStringUTF8Length(refs.chg_usage.state.value);
      if(length > 255 || length === 0) {
        refs.chg_usage.setState({
          error: true
        });
        refs.btn.setState({
          disabled: true
        });
        return;
      }
      let data = {};
      data.metadata = obj.metadata;
      data.metadata.usage = refs.chg_usage.state.value;
      request.updateUsage(obj.id, data).then(() => {
        callback && callback();
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'chg_usage':
          let length = utils.getStringUTF8Length(refs.chg_usage.state.value);
          if(length < 255 && length !== 0) {
            refs.chg_usage.setState({
              error: false
            });
          } else {
            refs.chg_usage.setState({
              error: true
            });
          }
          refs.btn.setState({
            disabled: refs.chg_usage.state.error
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
