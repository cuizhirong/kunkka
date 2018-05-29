const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('../../../../utils/error_message');


function pop(obj, parent, callback) {

  config.fields[0].value = obj.metadata.owner ? obj.metadata.owner : '';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      if(refs.chg_owner.state.value.length === 0) {
        refs.chg_owner.setState({
          error: true
        });
        refs.btn.setState({
          disabled: true
        });
        return;
      }
      let data = {};
      data.metadata = obj.metadata;
      data.metadata.owner = refs.chg_owner.state.value;
      request.updateOwner(obj.id, data).then(() => {
        callback && callback();
        cb(true);
      }).catch((err) => {
        refs.error.setState({
          value: getErrorMessage(err),
          hide: false
        });
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'chg_owner':
          if(refs.chg_owner.state.value.length > 0) {
            refs.chg_owner.setState({
              error: false
            });
            refs.btn.setState({
              disabled: false
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
