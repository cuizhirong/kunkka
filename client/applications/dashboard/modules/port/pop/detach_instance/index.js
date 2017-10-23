const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  config.fields[2].text = obj.server.name;

  let props = {
    __: __,
    parent: parent,
    config: config,

    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      let serverId = obj.server.id,
        portId = obj.id;

      request.detchInstance(serverId, portId).then((res) => {
        callback && callback();
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
