const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
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
        rawItem: obj.rawItem,
        types: obj.types
      });
    },
    onConfirm: function(refs, cb) {
      let data = refs.quota.state.overview;

      let volumesTotalLegal = checkVolumeTotalLegality(data, 'volumes');
      let volumesTotalGigaLegal = checkVolumeTotalLegality(data, 'gigabytes');

      if(!volumesTotalLegal) {
        cb(false, __.volumes_small_than_total);
      } else if(!volumesTotalGigaLegal) {
        cb(false, __.gigabytes_small_than_total);
      } else {
        request.modifyQuota(data, obj.rawItem.id).then((res) => {
          callback && callback();
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
