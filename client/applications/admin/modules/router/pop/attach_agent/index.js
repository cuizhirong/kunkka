const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function exeSequentially(req, arr, id) {
  if (arr && arr.length > 0) {
    const ele = arr.pop();
    return req(ele.id, id).then(() =>{
      return exeSequentially(req, arr, id);
    });
  } else {
    return Promise.resolve();
  }
}

function pop(obj, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getAgentsAndAttachedAgents(obj.id)
        .then((res) => {
          const L3Agents = res[0].agents.filter(agent => agent.agent_type === 'L3 agent');
          const attachedAgents = res[1].agents;
          const agentsToAttach = L3Agents.filter(agent => {
            return !attachedAgents.some(ele => ele.id === agent.id) && (agent.name = agent.host + ' (' + agent.id.substr(0, 8) + ')');
          });
          refs.agents.setState({
            data: agentsToAttach
          });
          if (agentsToAttach.length === 0) {
            refs.btn.setState({
              disabled: true
            });
          }
        });
    },
    onConfirm: function(refs, cb) {
      const selectedAgents = refs.agents.state.data.filter(ele => ele.selected);
      exeSequentially(request.attachAgent, selectedAgents, obj.id).then(() => {
        callback && callback();
        cb(true);
      }).catch(error => {
        cb(false, getErrorMessage(error));
        refs.btn.setState({
          disabled: false
        });
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'agents':
          let selectedAgents = state.data.some(item => {
            if (item.selected) {
              return true;
            } else {
              return false;
            }
          });
          refs.btn.setState({
            disabled: !selectedAgents
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
