var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
// var request = require('../../request');
// var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {},
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
