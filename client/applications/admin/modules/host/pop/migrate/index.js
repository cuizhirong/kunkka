var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  var {row, hostTypes} = obj;

  var currentHost = row.service.host;
  config.fields[0].text = currentHost;

  var hosts = [];
  hosts.push({
    id: 'auto',
    name: __.auto
  });

  hostTypes.forEach((host) => {
    var name = host.service.host;

    if (currentHost !== name) {
      hosts.push({
        id: name,
        name: name
      });
    }
  });

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.migrate_to.setState({
        data: hosts,
        value: hosts[0].id
      });
    },
    onConfirm: function(refs, cb) {
      var dest = refs.migrate_to.state.value;
      if (dest === 'auto') {
        dest = null;
      }
      var randomly = refs.migrate_host_tip.state.checked;

      cb(true);
      request.migrate(currentHost, dest, randomly);
    },
    onAction: function(field, state, refs) {
    },
    onLinkClick: function() {
    }
  };

  commonModal(props);
}

module.exports = pop;
