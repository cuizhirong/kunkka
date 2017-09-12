const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances().then((data) => {
        let instances = data.filter((item) => {
          let addresses = item.addresses;
          for (let key in addresses) {
            for (let ele of addresses[key]) {
              if (ele['OS-EXT-IPS:type'] === 'fixed') {
                return true;
              }
            }
          }

          return false;
        });

        if (instances.length > 0) {
          refs.instance.setState({
            data: instances,
            value: instances[0].id
          });
        } else {
          refs.tip_no_port_instance.setState({
            hide: true
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let serverID = refs.instance.state.value;
      let portID = refs.port.state.value;
      let fixedAddress = refs.port.state.data.find((ele) => ele.id === portID);
      let data = {
        addFloatingIp: {
          address: obj.floating_ip_address,
          fixed_address: fixedAddress.name
        }
      };

      request.associateInstance(serverID, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'instance':
          let instances = refs.instance.state.data;
          let selected = refs.instance.state.value;

          let item = instances.filter((instance) => instance.id === selected)[0];

          if (instances.length > 0) {
            let ports = [];
            let addresses = item.addresses;

            for (let key in addresses) {
              for (let ele of addresses[key]) {
                if (ele['OS-EXT-IPS:type'] === 'fixed') {
                  ports.push({
                    id: ele.port && ele.port.id,
                    name: ele.addr
                  });
                }
              }
            }

            refs.port.setState({
              data: ports,
              value: ports.length > 0 && ports[0].id,
              hide: ports.length > 0 ? false : true
            });

            refs.btn.setState({
              disabled: ports.length > 0 ? false : true
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
