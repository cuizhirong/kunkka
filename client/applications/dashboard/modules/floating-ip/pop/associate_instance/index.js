const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

function filterPorts(ports, subnets, floatingips) {
  let filteredPorts = [];
  let filteredFips = [];

  let portsMap1 = {};
  let portsMap2 = {};
  ports.forEach((port) => {
    portsMap1[port.subnetId] = port;
    portsMap2[port.id] = port;
  });

  let filteredSubnets = subnets.filter((subnet) => {
    if (subnet.id in portsMap1) {
      return true;
    }
    return false;
  });

  filteredFips = floatingips.filter((fip) => {
    if (fip.port_id in portsMap2) {
      return true;
    }
    return false;
  });

  // 先将加入了开启公网网关路由器中的子网端口加入数组
  filteredSubnets.forEach((subnet) => {
    if (subnet.router && subnet.router.external_gateway_info) {
      filteredPorts.push(portsMap1[subnet.id]);
    }
  });

  // 然后过滤掉已经绑定了公网 IP 的子网端口
  filteredFips.forEach((fip) => {
    filteredPorts = filteredPorts.filter((port) => {
      if(fip.port_id === port.id && fip.fixed_ip_address === port.fixedIp) {
        return false;
      }
      return true;
    });
  });

  return filteredPorts;
}

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let instances = [];
  let portsMap = {};

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances().then((data) => {
        instances = data.filter((item) => {
          let addresses = item.addresses;
          for (let key in addresses) {
            for (let ele of addresses[key]) {
              if (ele['OS-EXT-IPS:type'] === 'fixed') {
                portsMap[item.id] = [];
                return true;
              }
            }
          }

          return false;
        });


        if (instances.length > 0) {
          request.getFIPAndSubnetList().then((res) => {
            instances.forEach((instance) => {
              let addresses = instance.addresses;
              for (let key in addresses) {
                for (let ele of addresses[key]) {
                  if (ele['OS-EXT-IPS:type'] === 'fixed') {
                    portsMap[instance.id].push({
                      id: ele.port && ele.port.id,
                      subnetId: ele.subnet && ele.subnet.id,
                      fixedIp: ele.addr,
                      name: ele.addr
                    });
                  }
                }
              }

              portsMap[instance.id] = filterPorts(portsMap[instance.id], res.subnet, res.floatingip);
            });

            refs.instance.setState({
              data: instances,
              value: instances[0].id
            });
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
        if (HALO.settings.enable_floatingip_bandwidth) {
          request.changeBandwidth(obj.id, {
            fipratelimit: {}
          }).then(() => {
            callback && callback(res);
            cb(true);
          }).catch((error) => {
            cb(false, getErrorMessage(error));
          });
        } else {
          callback && callback(res);
          cb(true);
        }
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'instance':
          let instanceList = refs.instance.state.data;
          let selected = refs.instance.state.value;

          let item = instanceList.filter((instance) => instance.id === selected)[0];

          let ports = portsMap[item.id];
          if (instanceList.length > 0) {

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
