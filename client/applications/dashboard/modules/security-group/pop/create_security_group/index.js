const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');


function pop(parent, callback) {
  let securityGroups = [];
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getList().then(res => {
        securityGroups = res;
      });
    },
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
    onAction: function(filed, status, refs) {
      switch(filed) {
        case 'name':
          let hasName = securityGroups.some(sg => sg.name === refs.name.state.value);
          refs.name.setState({
            error: hasName
          });
          refs.btn.setState({
            disabled: hasName
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
