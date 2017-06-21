var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  if(obj.type === 'check'){
    config.fields[0].info = __.set_check_stack;
    config.title = ['examine', 'stack'];
  } else if(obj.type === 'suspend') {
    config.fields[0].info = __.set_suspend_stack;
    config.title = ['suspend', 'stack'];
  } else {
    config.fields[0].info = __.set_resume_stack;
    config.title = ['resume', 'stack'];
  }
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      var data;
      if(obj.type === 'check') {
        data = {'check': null};
      } else if (obj.type === 'suspend') {
        data = {'suspend': null};
      } else {
        data = {'resume': null};
      }
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
