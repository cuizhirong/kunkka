var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  var getSubnetGroup = function(subnets) {
    var subnetArray = [];
    subnets.map((subnet, i) => {
      if(subnetArray.length === 0) {
        subnetArray.push({
          value: subnet.network.id,
          name: subnet.network.name,
          data: [{
            id: i,
            uuid: subnet.network_id,
            name: subnet.name + '(' + subnet.cidr + ')'
          }]
        });
      } else {
        var duplication = false;
        subnetArray.some((ele) => {
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
            value: subnet.network.id,
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
      if(!port.server) {
        portArray.push({
          id: port.id,
          name: port.fixed_ips[0].ip_address + '/' + (port.name || ('(' + port.id.slice(0, 8) + ')'))
        });
      }
    });
    return portArray;
  };
  var networkId = {},
    allSubnet = [];

  config.fields[0].text = obj.rawItem.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSubnetList().then((data) => {
        if(data.length > 0) {
          getSubnetGroup(data).map((group) => {
            allSubnet.push(...group.data);
          });
          allSubnet.sort((a, b) => {
            return a.id - b.id;
          });
          networkId.net_id = allSubnet[0].uuid;
          refs.select_subnet.setState({
            data: getSubnetGroup(data)
          });
        }
      });
      request.getPortList().then((data) => {
        if(data.length > 0) {
          refs.select_interface.setState({
            data: getPort(data),
            value: data[0].id
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.joinNetwork(obj.rawItem, networkId).then((res) => {
        callback(res);
        cb(true);
      });
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
        networkId.port_id = portId;
      }
    },
    onLinkClick: function() {

    }
  };

  commonModal(props);
}

module.exports = pop;
