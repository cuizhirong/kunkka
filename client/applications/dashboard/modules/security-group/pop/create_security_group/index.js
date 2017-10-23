const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');

function pop(parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {
        name: refs.name.state.value,
        description: refs.desc.state.value
      };
      request.addSecurityGroup(data).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(filed, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
