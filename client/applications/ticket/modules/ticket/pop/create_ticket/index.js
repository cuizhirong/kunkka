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
      var data = [{
        id: 'breakdown',
        name: __.breakdown
      }, {
        id: 'consultation',
        name: __.consultation
      }, {
        id: 'application',
        name: __.application
      }];
      var selectedItem = data[0].id;
      refs.select_type.setState({
        data: data,
        value: selectedItem
      });
      refs.attach_file.setState({
        renderer: popAttach
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        title: refs.title.state.value,
        description: refs.description.state.value,
        type: refs.select_type.state.value,
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
