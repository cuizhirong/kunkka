const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
const resourceQuota = require('./quota_pop');
const getErrorMessage = require('../../../../utils/error_message');
const quotaValidate = require('client/utils/quota_validate').quotaValidate;

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    width: 814,
    onInitialize: function(refs) {
      refs.quota.setState({
        renderer: resourceQuota,
        overview: obj.overview,
        rawItem: obj.rawItem,
        types: obj.types
      });
    },
    onConfirm: function(refs, cb) {
      let data = refs.quota.state.overview;
      const validateResult = quotaValidate(data, __);

      if(validateResult.status === 'fail') {
        cb(false, validateResult.errorMessage, true);
      } else {
        request.modifyQuota(data, obj.rawItem.id).then((res) => {
          callback && callback();
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error), true);
        });
      }
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
