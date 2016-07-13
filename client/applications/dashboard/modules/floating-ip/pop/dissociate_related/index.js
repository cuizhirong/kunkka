var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name;
  if(obj.association && obj.association.type === 'server') {
    config.fields[2].field = 'instance';
    config.fields[2].icon_type = 'instance';
    config.fields[2].text = obj.association.device.name;
  } else if (obj.lbaas) {
    config.fields[2].field = 'loadbalancer';
    config.fields[2].icon_type = 'lb';
    config.fields[2].text = obj.lbaas.name;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.dissociateResource(obj.id).then((res) => {
        callback && callback(res.floatingip);
        cb(true);
      });
    },
    onAnction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
