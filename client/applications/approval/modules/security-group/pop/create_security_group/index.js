const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/approval.lang.json');

function pop(parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {};
      data.detail = {};
      let createDetail = data.detail;
      createDetail.create = [];
      let configCreate = createDetail.create;
      let createItem = {};
      createItem = {
        _type: 'SecurityGroup',
        _identity: 'security',
        name: refs.name.state.value,
        description: refs.desc.state.value
      };
      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;
      request.createApplication(data).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      let name = refs.name.state;
      switch (field) {
        case 'name':
          if(name.error === true && name.value === '') {
            refs.name.setState({
              error: false
            });
          }
          break;
        default:
          break;
      }
      refs.btn.setState({
        disabled: !(!name.error && name.value)
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
