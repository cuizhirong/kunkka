var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  switch(obj.type) {
    case 'check':
      config.fields[0].info = __.set_check_stack;
      config.title = ['examine', 'stack'];
      break;
    case 'resume':
      config.fields[0].info = __.set_resume_stack;
      config.title = ['resume', 'stack'];
      break;
    case 'suspend':
      config.fields[0].info = __.set_suspend_stack;
      config.title = ['suspend', 'stack'];
      break;
    default:
      break;
  }
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      var data = {};
      data[obj.type] = null;

      request.checkStack(obj.row, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false);
      });
    },
    onAction: function(field, status, refs){
    }
  };

  commonModal(props);
}

module.exports = pop;
