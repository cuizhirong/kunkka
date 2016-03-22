var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

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
            uuid: subnet.network_id,
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
              uuid: subnet.network_id,
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
              uuid: subnet.network_id,
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
        id: port.id,
        name: port.fixed_ips[0].ip_address + '/' + (port.name || ('(' + port.id.slice(0, 8) + ')'))
      });
    });
    return portArray;
  };
  var networkId = {},
    allSubnet = [];

  config.fields[0].text = obj.rawItem.name;
  config.fields[1].data = getSubnetGroup(obj.subnet);
  config.fields[2].data = getPort(obj.port);

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      getSubnetGroup(obj.subnet).map((group) => {
        allSubnet.push(...group.data);
      });
      allSubnet.sort((a, b) => {
        return a.id - b.id;
      });
      networkId.net_id = allSubnet[0].uuid;
    },
    onConfirm: function(refs, cb) {
      request.joinNetwork(obj.rawItem, networkId).then(() => {
        callback();
      });
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
      if(state.checkedField === 'select_subnet') {
        networkId = {};
        var index = refs.select_subnet.state.value;
        networkId.net_id = index ? allSubnet[index].uuid : allSubnet[0].uuid;
      } else {
        networkId = {};
        var portId = refs.select_interface.state.value;
        networkId.port_id = portId ? portId : getPort(obj.port)[0].id;
      }
    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
