var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getStatusIcon = require('../../../../utils/status_icon');

function pop(obj, parent, callback) {
  config.fields[0].data = obj;
  config.fields[0].getStatusIcon = getStatusIcon;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let ids = [],
        data = {
          'unlock': null
        };
      obj.forEach(item => {
        ids.push(item.id);
      });
      request.lockIntance(ids, data).then(res => {
        cb(true);
        callback && callback();
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
