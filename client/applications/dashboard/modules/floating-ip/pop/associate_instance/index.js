var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances().then((instances) => {
        refs.instance.setState({
          data: instances,
          value: instances[0].id
        });
      });
    },
    onConfirm: function(refs, cb) {
      request.associateInstance(obj, refs.port.state.value).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'instance':
          var instances = refs.instance.state.data;
          var selected = refs.instance.state.value;

          var item = instances.filter((instance) => instance.id === selected)[0];

          if (instances.length > 0) {
            var ports = [];
            var addresses = item.addresses;

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
