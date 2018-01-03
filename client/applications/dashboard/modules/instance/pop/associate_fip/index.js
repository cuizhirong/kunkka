const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const createFloatingIp = require('client/applications/dashboard/modules/floating-ip/pop/apply_ip/index');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function addEnaleBindFIPField(ports, subnetList) {
  let returnedPorts = [];
  let portsMap = {};
  ports.forEach((port) => {
    portsMap[port.subnetId] = port;
  });

  let filteredSubnets = subnetList.filter((subnet) => {
    if(subnet.id in portsMap) {
      return true;
    }
    return false;
  });

  filteredSubnets.forEach((subnet) => {
    if(subnet.router && subnet.router.external_gateway_info) {
      returnedPorts.push(Object.assign({}, portsMap[subnet.id], { enableBindFIP: true }));
    } else {
      returnedPorts.push(Object.assign({}, portsMap[subnet.id], { enableBindFIP: false }));
    }
  });

  return returnedPorts;
}

function pop(obj, parent, callback) {

  config.fields[0].text = obj.name;

  let ports = [];
  let addresses = obj.addresses;

  for (let key in addresses) {
    for (let ele of addresses[key]) {
      if (ele['OS-EXT-IPS:type'] === 'fixed') {
        ports.push({
          id: ele.port.id,
          subnetId: ele.subnet.id,
          name: ele.addr
        });
      }
    }
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSubnetAndFIPList().then((data) => {
        ports = addEnaleBindFIPField(ports, data.subnet);
        let dataArray = [];

        if(ports.length > 0) {
          refs.local_ip.setState({
            data: ports,
            value: ports[0].id
          });
          refs.router_did_not_enable_external_gateway.setState({
            hide: ports[0].enableBindFIP
          });
        }

        if(data.floatingip.length > 0) {
          data.floatingip.some((_data) => {
            if((!_data.association.type || _data.association.type !== 'server') && !_data.fixed_ip_address) {
              _data.name = _data.floating_ip_address;
              dataArray.push(_data);
            }
          });
          refs.floating_ip.setState({
            data: dataArray,
            value: dataArray[0] ? dataArray[0].id : ''
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        addFloatingIp: {
          address: ''
        }
      };
      refs.floating_ip.state.data.some((ele) => {
        if(refs.floating_ip.state.value === ele.id) {
          data.addFloatingIp.address = ele.floating_ip_address;
        }
      });
      if(!!refs.local_ip.state.value) {
        refs.local_ip.state.data.some((item) => {
          if(refs.local_ip.state.value === item.id) {
            data.addFloatingIp.fixed_address = item.name;
          }
        });
      }

      request.associateFloatingIp(obj.id, data).then((res) => {
        if (HALO.settings.enable_floatingip_bandwidth) {
          request.changeBandwidth(refs.floating_ip.state.value, {
            fipratelimit: {}
          }).then(() => {
            callback && callback(res);
            cb(true);
          }).catch((error) => {
            if (error.status !== 404) {
              cb(false, getErrorMessage(error));
            } else {
              cb(true);
            }
          });
        } else {
          callback && callback(res);
          cb(true);
        }
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {
      const selectedIndex = ports.findIndex((port) => {
        return port.id === refs.local_ip.state.value;
      });

      switch(field) {
        case 'floating_ip':
          if(refs.floating_ip.state.clicked) {
            createFloatingIp(refs.modal, (res) => {
              res.name = res.floating_ip_address;
              refs.floating_ip.setState({
                data: [res],
                value: res.id,
                clicked: false
              });

              refs.btn.setState({
                disabled: selectedIndex === -1 || !ports[selectedIndex].enableBindFIP
              });
            });
          } else {
            refs.btn.setState({
              disabled: refs.floating_ip.state.data.length === 0 || selectedIndex === -1 || !ports[selectedIndex].enableBindFIP
            });
          }
          break;
        case 'local_ip':
          refs.router_did_not_enable_external_gateway.setState({
            hide: selectedIndex === -1 || ports[selectedIndex].enableBindFIP
          });
          refs.btn.setState({
            disabled: refs.floating_ip.state.data.length === 0 || selectedIndex === -1 || !ports[selectedIndex].enableBindFIP
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
