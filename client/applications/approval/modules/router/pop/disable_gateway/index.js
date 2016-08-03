var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  var name = obj.name ? obj.name : '(' + obj.id.substr(0, 8) + ')';
  config.fields[0].info = __[config.fields[0].field].replace('{0}', name);

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
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
