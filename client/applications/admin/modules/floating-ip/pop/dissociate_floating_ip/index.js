var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.floating_ip_address;

  var device = config.fields[2];
  if(obj.server_id) {
    device.field = 'server';
    device.icon_type = 'instance';
    device.text = obj.server_name || '(' + obj.server_id.slice(0, 8) + ')';
  } else if(obj.router_id) {
    device.field = 'router';
    device.icon_type = 'router';
    device.text = obj.router_name || '(' + obj.router_id.slice(0, 8) + ')';
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {
        floatingip: {
          port_id: null
        }
      };

      request.dissociateFloatingIp(obj.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
