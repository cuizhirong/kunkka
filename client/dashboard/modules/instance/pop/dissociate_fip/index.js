var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {

  config.fields[0].text = obj.name;
  config.fields[1].text = obj.floating_ip.floating_ip_address;

  var props = {
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      var data = {
        removeFloatingIp: {
          address: obj.floating_ip.floating_ip_address
        }
      };
      request.create(obj.id, data).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {

    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
