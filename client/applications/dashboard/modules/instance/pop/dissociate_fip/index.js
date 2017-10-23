const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {

  config.fields[0].text = obj.name;
  config.fields[1].text = obj.floating_ip.floating_ip_address;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      let data = {
        removeFloatingIp: {
          address: obj.floating_ip.floating_ip_address
        }
      };
      request.dissociateFloatingIp(obj.id, data).then((res) => {
        callback && callback(res);
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
