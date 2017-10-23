const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(data, parent, callback) {
  let {rawItem, rows} = data,
    obj = rows[0];
  config.fields[0].text = obj.name || '(' + obj.server_id.slice(0, 8) + ')';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.weight.setState({
        value: obj.weight
      });
    },
    onConfirm: function(refs, cb) {
      let weightParam = {
        weight: refs.weight.state.value
      };
      request.updateMember(rawItem.id, obj.id, weightParam).then(res => {
        callback && callback();
        cb(true);
      }).catch(error => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      let weightState = refs.weight.state;
      if(weightState.value && !weightState.error) {
        refs.btn.setState({
          disabled: false
        });
      } else {
        refs.btn.setState({
          disabled: true
        });
      }
      switch(field) {
        case 'weight':
          let weight = refs.weight.state.value;
          if(weight > 0 && weight < 101) {
            refs.weight.setState({
              error: false
            });
          } else {
            refs.weight.setState({
              error: true
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
