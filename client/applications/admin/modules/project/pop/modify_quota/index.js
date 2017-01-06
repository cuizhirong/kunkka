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
        overview: obj[0],
        rawItem: obj[1],
        types: obj[2]
      });
    },
    onConfirm: function(refs, cb) {
      var data = refs.quota.state.overview;
      request.modifyQuota(data, obj[1].id).then((res) => {
        callback && callback();
        cb(true);
      }).catch(error => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
