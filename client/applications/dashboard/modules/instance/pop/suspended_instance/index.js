var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  config.fields[0].info = __.confirm_inst_action.replace('{0}', __.suspended);
  config.fields[1].data = obj;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      let ids = [],
        data = {
          'suspend': null
        };
      obj.forEach(item => {
        ids.push(item.id);
      });
      request.suspendedIntance(ids, data).then(res => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
