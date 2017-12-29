const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');

const copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function pop(obj, parent, callback) {
  function getSubnetGroup(subnetArray) {
    let subnets = subnetArray.filter((ele) => !ele.network['router:external']);
    let joinedSubnet = [],
      subnetGroup = [],
      hasAvailableSubnet = false;

    for (let key in obj.addresses) {
      for (let item of obj.addresses[key]) {
        if (item['OS-EXT-IPS:type'] === 'fixed') {
          joinedSubnet.push(item.subnet);
        }
      }
    }

    if (joinedSubnet.length === 0 && subnets.length > 0) {
      hasAvailableSubnet = true;
    }

    joinedSubnet.forEach((item) => {
      subnets.some((subnet) => {
        if (subnet.id === item.id) {
          subnet.disabled = true;
          return true;
        }
        return false;
      });
    });
    if(subnets.length > joinedSubnet.length) {
      hasAvailableSubnet = true;
    }

    if (hasAvailableSubnet) {
      subnets.forEach((subnet) => {
        let hasGroup = subnetGroup.some((group) => {
          if (group.id === subnet.network_id && !subnet.disabled) {
            group.data.push(subnet);
            return true;
          }
          return false;
        });
        if (!hasGroup && !subnet.disabled) {
          subnetGroup.push({
            id: subnet.network_id,
            name: subnet.network.name || '(' + subnet.network.id.substring(0, 8) + ')',
            port_security_enabled: subnet.network.port_security_enabled,
            shared: subnet.network.shared,
            data: [subnet]
          });
        }
      });
    }
    return subnetGroup;
  }

  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSubnetList().then((data) => {
        data = copyObj(data);
        if (data.length > 0) {
          let subnetGroup = getSubnetGroup(data);

          if (subnetGroup.length > 0) {
            refs.select_subnet.setState({
              data: subnetGroup,
              value: subnetGroup[0].data[0].id
            });

            refs.btn.setState({
              disabled: false
            });
          }
        }
      });
      request.getPortList().then((data) => {
        if (data.length > 0) {
          let ports = copyObj(data);
          let filteredData = ports.filter((port) => {
            if (!port.device_owner) {
              let ip = '';
              if (port.fixed_ips && port.fixed_ips.length > 0) {
                ip = port.fixed_ips[0].ip_address;
              }
              port.name = ip + ' / ' + (port.name ? port.name : '(' + port.id.substring(0, 8) + ')');
            }
            return !port.device_owner;
          });
          refs.select_interface.setState({
            data: filteredData,
            value: filteredData[0] ? filteredData[0].id : ''
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      if (refs.select_subnet.state.checkedField === 'select_subnet') {
        let networkId = '',
          portSecurityEnabled = true,
          shared = false;
        refs.select_subnet.state.data.some((group) => {
          return group.data.some((s) => {
            if (s.id === refs.select_subnet.state.value) {
              networkId = group.id;
              portSecurityEnabled = group.port_security_enabled;
              shared = group.shared;
              return true;
            }
            return false;
          });
        });

        if (shared) {
          request.joinNetwork(obj, {
            net_id: networkId
          }).then((res) => {
            callback && callback(res);
            cb(true);
          });
        } else {
          let port = {
            network_id: networkId,
            fixed_ips: [{
              subnet_id: refs.select_subnet.state.value
            }],
            port_security_enabled: portSecurityEnabled
          };
          request.createPort(port).then((p) => {
            request.joinNetwork(obj, {
              port_id: p.port.id
            }).then((res) => {
              callback && callback(res);
              cb(true);
            });
          });
        }
      } else {
        request.joinNetwork(obj, {
          port_id: refs.select_interface.state.value
        }).then((res) => {
          callback && callback(res);
          cb(true);
        });
      }
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'select_subnet':
          refs.select_interface.setState({
            checkedField: state.checkedField
          });

          if (state.checkedField === 'select_subnet') {
            let subnetDisabled = refs.select_subnet.state.data.length === 0;
            refs.btn.setState({
              disabled: subnetDisabled
            });
          }
          break;
        case 'select_interface':
          refs.select_subnet.setState({
            checkedField: state.checkedField
          });

          if (state.checkedField === 'select_interface') {
            let portDisabled = refs.select_interface.state.data.length === 0;
            refs.btn.setState({
              disabled: portDisabled
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
