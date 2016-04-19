var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  console.log(obj);
  config.fields[1].text = obj.floating_ip_address;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {

    },
    onConfirm: function(refs, cb) {
      var data = {
        server_id: obj.instance_id,
        removeFloatingIp: {
          address: obj.floating_ip_address
        }
      };
      request.dissociateFloatingIp(obj.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAnction: function(field, status, refs) {

    }
  };

  commonModal(props);
}

module.exports = pop;
