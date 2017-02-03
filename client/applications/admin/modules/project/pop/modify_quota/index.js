var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/admin.lang.json');
var request = require('../../request');
var resourceQuota = require('./quota_pop');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  var props = {
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
      var data = refs.quota.state.overview;
      function getTotalVolumes() {
        var t = 0;
        for(var o in data) {
          if(o.indexOf('volumes_') > -1) {
            t += data[o].total;
          }
        }
        return t;
      }
      if(data.volumes.total < getTotalVolumes()) {
        cb(false, __.small_than_total);
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
