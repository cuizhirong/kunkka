const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {
        qos_specs: {
          name: refs.name.state.value,
          consumer: refs.consumer.state.value
        }
      };

      request.createQosSpec(data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'name':
          refs.btn.setState({
            disabled: !state.value
          });
          break;
        default:
          return;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
