const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('../../request');
const resourceQuota = require('./quota_pop');
const getErrorMessage = require('../../../../utils/error_message');
const checkVolumeTotalLegality = require('client/utils/check_total_legality').checkVolumeTotalLegality;


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
      let totalLegal = checkVolumeTotalLegality(targetQuota, 'volumes');
      let totalGigaLegal = checkVolumeTotalLegality(targetQuota, 'gigabytes');

      if(!totalLegal) {
        cb(false, __.volumes_small_than_total);
      } else if(!totalGigaLegal) {
        cb(false, __.gigabytes_small_than_total);
      } else {
        request.applyQuotas(addedQuota, overview, targetQuota).then((res) => {
          callback && callback();
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function() {}
  };

  commonModal(props);
}

module.exports = pop;
