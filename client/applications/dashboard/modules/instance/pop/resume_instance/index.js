var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var isPaused;

function pop(obj, parent, callback) {
  config.fields[0].data = obj;
  isPaused = obj[0].status === 'paused';

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let ids = [], data;
      if (!isPaused) {
        data = {
          'resume': null
        };
      } else {
        data = {
          'unpause': null
        };
      }
      obj.forEach(item => {
        ids.push(item.id);
      });
      request.resumeInstance(ids, data).then(res => {
        cb(true);
        callback && callback();
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
