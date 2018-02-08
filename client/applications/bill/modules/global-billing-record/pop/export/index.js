const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/bill.lang.json');
// const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      const startTime = refs.range_time.state.value.start;
      const endTime = refs.range_time.state.value.end;
      let data = {
        format: refs.format.state.value
      };
      if(startTime && endTime) {
        data.startTime = startTime;
        data.endTime = endTime;
      }
      if(refs.all_accounts.state.checkedField === 'all_accounts') {
        data.type = 'all_accounts';
      } else {
        data.type = 'specified_account';
        data.id = refs.specified_account.state.value;
      }
      request.export(data).then(res => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      let disabled = true;
      if(refs.all_accounts.state.checkedField === 'all_accounts'
          || (refs.specified_account.state.checkedField === 'specified_account'
            && refs.specified_account.state.value)) {
        disabled = false;
      }
      switch(field) {
        case 'all_accounts':
          refs.specified_account.setState({
            checkedField: state.checkedField
          });
          break;
        case 'specified_account':
          refs.all_accounts.setState({
            checkedField: state.checkedField
          });
          refs.specified_account.setState({
            error: !state.value
          });
          break;
        default:
          break;
      }
      refs.btn.setState({
        disabled: disabled
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
