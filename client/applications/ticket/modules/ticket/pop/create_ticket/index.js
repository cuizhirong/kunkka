const commonModal = require('client/components/modal_common/index');
const __ = require('locale/client/ticket.lang.json');
const config = require('./config.json');
const getErrorMessage = require('client/applications/ticket/utils/error_message');
const popAttach = require('./attach');
const request = require('../../request');

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let data = [{
        id: 'breakdown',
        name: __.breakdown
      }, {
        id: 'consultation',
        name: __.consultation
      }, {
        id: 'application',
        name: __.application
      }];
      let selectedItem = data[0].id;
      refs.select_type.setState({
        data: data,
        value: selectedItem
      });
      refs.attach_file.setState({
        renderer: popAttach,
        type: 'create'
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
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
    onAction: function(field, state, refs) {
      if (refs.title.state.value && refs.description.state.value) {
        refs.btn.setState({
          disabled: false
        });
      } else {
        refs.btn.setState({
          disabled: true
        });
      }
    },
    onLinkClick: function() {}
  };

  commonModal(props);
}

module.exports = pop;
