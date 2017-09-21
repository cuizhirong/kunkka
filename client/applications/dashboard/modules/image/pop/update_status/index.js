let commonModal = require('client/components/modal_common/index');
let config = require('./config.json');
let __ = require('locale/client/dashboard.lang.json');
let showMembers = require('./show_members');

function pop(obj, parent, callback) {
  //config.fields[0].text = obj.name;
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.members.setState({
        renderer: showMembers,
        callback: callback
      });
    },
    onConfirm: function(refs, cb) {
      cb(true);
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
