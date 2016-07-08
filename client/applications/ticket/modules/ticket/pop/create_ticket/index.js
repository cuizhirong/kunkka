var commonModal = require('client/components/modal_common/index');
var __ = require('locale/client/ticket.lang.json');
var config = require('./config.json');
var getErrorMessage = require('client/applications/ticket/utils/error_message');
var popAttach = require('./attach');
var request = require('../../request');

function pop(obj, parent, callback) {

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.attach_file.setState({
        renderer: popAttach
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        title: refs.title.state.value,
        description: refs.description.state.value,
        type: 'pending',
        status: 'pending',
        attachments: refs.attach_file.refs.child.state.attachments
      };
      request.createTickets(data).then((res) => {
        callback && callback();
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {},
    onLinkClick: function() {}
  };

  commonModal(props);
}

module.exports = pop;
