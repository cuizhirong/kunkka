const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const info = require('./info.jsx');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, callback) {
  console.log(obj);

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {
      refs.agree.setState({
        renderer: info,
        accountName: obj.name,
        __: __
      });
    },
    onConfirm: function(refs, cb) {
      request.agreeApplication(obj.id).then((res) => {
        callback && callback();
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function() {}
  };

  commonModal(props);
}

module.exports = pop;
