let commonModal = require('client/components/modal_common/index');
let config = require('./config.json');
let __ = require('locale/client/admin.lang.json');
let request = require('../../request');
let resourceQuota = require('./quota_pop');
let getErrorMessage = require('../../../../utils/error_message');

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
      function getTotalVolumes() {
        let t = 0;
        for(let o in data) {
          if(o.indexOf('volumes_') > -1) {
            t += data[o].total;
          }
        }
        return t;
      }
      function getTotalGigabytes() {
        let t = 0;
        for(let o in data) {
          if(o.indexOf('gigabytes_') > -1) {
            t += data[o].total;
          }
        }
        return t;
      }
      if(data.volumes.total < getTotalVolumes()) {
        cb(false, __.volumes_small_than_total);
      } else if(data.gigabytes.total < getTotalGigabytes()) {
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
