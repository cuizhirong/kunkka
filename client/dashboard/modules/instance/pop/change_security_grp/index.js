var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {

  config.fields[0].text = obj.name;
  var ports = [];
  var addresses = obj.addresses;

  for (let key in addresses) {
    for (let ele of addresses[key]) {
      if (ele['OS-EXT-IPS:type'] === 'fixed') {
        ports.push({
          id: ele.port.id,
          name: ele.addr,
          'security_groups': ele.security_groups
        });
      }
    }
  }

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if(ports.length > 0) {
        refs.port.setState({
          data: ports,
          value: ports[0].id
        });

        request.getSecuritygroupList().then((data) => {
          if(data.length > 0) {
            refs.security_group.setState({
              data: data,
              value: data[0].id
            });
          }
        });

        refs.btn.setState({
          disabled: false
        });
      }
    },
    onConfirm: function(refs, cb) {
      var data = {
        port: {
          security_groups : []
        }
      };
      refs.security_group.state.data.some(function(ele) {
        if(ele.selected) {
          data.port.security_groups.push(ele.id);
        }
      });
      request.updateSecurity(refs.port.state.value, data).then((res) => {
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
