const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
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
        targetQuota: obj.targetQuota,
        addedQuota: obj.addedQuota,
        types: obj.types
      });
    },
    onConfirm: function(refs, cb) {
      let overview = refs.quota.state.overview;
      let targetQuota = refs.quota.state.targetQuota;
      let addedQuota = refs.quota.state.addedQuota;
      const validateResult = quotaValidate(targetQuota, __);

      if(validateResult.status === 'fail') {
        cb(false, validateResult.errorMessage, true);
      } else {
        request.applyQuotas(addedQuota, overview, targetQuota).then((res) => {
          cb(true);
          callback && callback();
        }).catch(error => {
          cb(false, getErrorMessage(error), true);
        });
      }
    },
    onAction: function() {}
  };

  commonModal(props);
}

module.exports = pop;
