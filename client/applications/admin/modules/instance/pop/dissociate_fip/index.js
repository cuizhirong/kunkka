const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {

  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let ips = obj._floatingIP.map((ele) => {
        return {
          id: ele,
          name: ele
        };
      });

      refs.floating_ip.setState({
        data: ips,
        value: ips[0].id
      });
    },
    onConfirm: function(refs, cb) {
      let data = {};
      data.removeFloatingIp = {
        address: refs.floating_ip.state.value
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
