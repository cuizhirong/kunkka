const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let agentIds = obj.agents.map(agent => agent.id);
      request.deleteAgent(agentIds, obj.id).then((res) => {
        request.repairAgent(agentIds, obj.id).then(() => {
          callback && callback();
          cb(true);
        }).catch(function(error) {
          cb(false, getErrorMessage(error));
          refs.btn.setState({
            disabled: true
          });
        });
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
        refs.btn.setState({
          disabled: true
        });
      });
    },
    onAction: function() {}
  };

  commonModal(props);
}

module.exports = pop;
