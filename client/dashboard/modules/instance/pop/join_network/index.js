var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  var getSubnetGroup = function(subnets) {
    var subnetArray = [];
    subnets.map((subnet, i) => {
      if(subnetArray.length === 0) {
        subnetArray.push({
          value: i,
          name: subnet.network.name,
          data: [{
            id: i,
            name: subnet.name + '(' + subnet.cidr + ')'
          }]
        });
      } else {
        var duplication = false;
        subnetArray.forEach((ele) => {
          if(ele.name === subnet.network.name) {
            duplication = duplication || true;
            ele.data.push({
              id: i,
              name: subnet.name + '(' + subnet.cidr + ')'
            });
          } else {
            duplication = duplication || false;
          }
        });
        if(!duplication) {
          subnetArray.push({
            value: i,
            name: subnet.network.name,
            data: [{
              id: i,
              name: subnet.name + '(' + subnet.cidr + ')'
            }]
          });
        }
      }
    });
    return subnetArray;
  };
  var getPort = function(ports) {
    var portArray = [];
    ports.map((port, i) => {
      portArray.push({
        id: i,
        name: port.fixed_ips[0].ip_address + '/' + (port.name || ('(' + port.id.slice(0, 8) + ')'))
      });
    });
    return portArray;
  };

  config.fields[0].text = obj.rawItem.name;
  config.fields[1].data = getSubnetGroup(obj.subnet);
  config.fields[2].data = getPort(obj.port);

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'select_subnet':
          refs.select_interface.setState({
            checkedField: state.checkedField
          });
          break;
        case 'select_interface':
          refs.select_subnet.setState({
            checkedField: state.checkedField
          });
          break;
        default:
          break;
      }
    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
