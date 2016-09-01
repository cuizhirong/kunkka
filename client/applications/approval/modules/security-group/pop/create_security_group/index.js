var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');

function pop(parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {};
      data.detail = {};
      var createDetail = data.detail;
      createDetail.create = [];
      var configCreate = createDetail.create;
      var createItem = {};
      createItem = {
        _type: 'SecurityGroup',
        _identity: 'security',
        name: refs.name.state.value
      };
      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;
      request.addSecurityGroup(data).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      var name = refs.name.state;
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
