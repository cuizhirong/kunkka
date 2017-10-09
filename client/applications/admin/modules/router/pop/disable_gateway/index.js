const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, parent, callback) {
  let name = obj.name ? obj.name : '(' + obj.id.substr(0, 8) + ')';
  config.fields[0].info = __[config.fields[0].field].replace('{0}', name);

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {
        external_gateway_info: null
      };
      request.updateRouter(obj.id, data).then((res) => {
        callback && callback(res.router);
        cb(true);
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
