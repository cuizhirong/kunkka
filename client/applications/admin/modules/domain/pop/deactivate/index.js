var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/admin.lang.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  config.fields[0].info = __[config.fields[0].field].replace('{0}', obj.name);

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        enabled : false
      };
      request.editDomain(obj.id, data).then((res) => {
        callback && callback(res.domain);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'de_domain_tip':
          refs.btn.setState({
            disabled: !status.checked
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
