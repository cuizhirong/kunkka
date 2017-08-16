let commonModal = require('client/components/modal_common/index');
let config = require('./config.json');
let request = require('../../request');
let networkType = require('./network_type');
let __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('../../../../utils/error_message');

function chooseVlan(refs, vlanState, testVlan, testAddr, netVlanstate, subnetChecked){
  if (!testVlan.test(vlanState.value)) {
    refs.btn.setState({
      disabled: true
    });
    refs.vlan_id.setState({
      error: vlanState.value !== ''
    });
  } else if (subnetChecked) {
    refs.vlan_id.setState({
      error: false
    });
    if (vlanState.value !== '' && netVlanstate.value === ''){
      refs.btn.setState({
        disabled: true
      });
    } else {
      if(testAddr.test(netVlanstate.value) && testVlan.test(vlanState.value)) {
        refs.btn.setState({
          disabled: false
        });
      }
    }
  } else if (!subnetChecked) {
    refs.vlan_id.setState({
      error: false
    });
    refs.btn.setState({
      disabled: vlanState.value === ''
    });
  }
}

function chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr) {
  if (!testFlat.test(flatState.value)) {
    refs.btn.setState({
      disabled: true
    });
    refs.physical_network.setState({
      error: flatState.value !== ''
    });
  } else if (subnetChecked) {
    refs.physical_network.setState({
      error: false
    });
    if (flatState.value !== '' && netVlanstate.value === ''){
      refs.btn.setState({
        disabled: true
      });
    } else {
      if(testAddr.test(netVlanstate.value) && flatState) {
        refs.btn.setState({
          disabled: false
        });
      }
    }
  } else if (!subnetChecked) {
    refs.physical_network.setState({
      error: false
    });
    refs.btn.setState({
      disabled: flatState.value === ''
    });
  }
}

function pop(parent, callback) {
  if (!HALO.settings.is_show_vlan) {
    config.fields[2].hide = true;
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs, field) {
      refs.enable_vlan.setState({
        renderer: networkType
      });
      let phyNet = HALO.configs.neutron_network_vlanranges.split(',');
      let phyItem;
      let item = phyNet.map((items, index) => {
        phyItem = items.split(':');
        return {
          id: phyItem[0],
          name: phyItem[0]
        };
      });
      refs.select_physical_network.setState({
        data: item,
        value: item[0].id
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        name: refs.network_name.state.value
      };
      let netType = refs.enable_vlan.refs.enable_type.state.selectedValue;
      switch(netType) {
        case 'vlan':
          data['provider:network_type'] = 'vlan';
          refs.vlan_id.setState({
            hide: false
          });
          let v = HALO.configs.neutron_network_vlanranges;
          let vArr = v.split(',');
          let vId = refs.vlan_id.state.value;
          let physicalNetwork = refs.select_physical_network.state.value;
          vArr.forEach(item => {
            let arrItem = item.split(':');
            if(arrItem[0] === physicalNetwork) {
              if(!isNaN(vId) && vId > parseInt(arrItem[1], 10) && vId < parseInt(arrItem[2], 10)) {
                data['provider:segmentation_id'] = vId;
                data['provider:physical_network'] = physicalNetwork;
              } else {
                refs.btn.setState({
                  disabled: true
                });
              }
            }
          });
          break;
        case 'vxlan':
          data['provider:network_type'] = 'vxlan';
          break;
        case 'flat':
          data['provider:network_type'] = 'flat';
          let physical = refs.physical_network.state.value;
          if(physical !== '') {
            data['provider:physical_network'] = physical;
          }
          break;
        default:
          break;
      }
      if (!refs.enable_security.state.checked) {
        data.port_security_enabled = false;
      }

      if(refs.create_subnet.state.checked) {
        request.createNetwork(data).then((res) => {
          data = {
            ip_version: 4,
            name: refs.subnet_name.state.value,
            network_id: res.network.id,
            cidr: refs.net_address.state.value,
            enable_dhcp: true
          };
          request.createSubnet(data).then(() => {
            callback && callback(res.network);
            cb(true);
          });
        });
      } else {
        request.createNetwork(data).then((res) => {
          callback && callback(res.network);
          cb(true);
        }).catch(err => {
          cb(false, getErrorMessage(err));
        });
      }
    },
    onAction: function(field, status, refs) {
      let subnetChecked = refs.create_subnet.state.checked,
        netVlanstate = refs.net_address.state,
        testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/,
        vlanState = refs.vlan_id.state,
        flatState = refs.physical_network.state,
        enableType = refs.enable_vlan.refs.enable_type.state.selectedValue,
        testFlat = /^\w+$/;
      let phyiscalNet = refs.select_physical_network.state.value;
      let vlanStatus = [{
        vlanReg: /^([1-9]\d{0,1}|100)$/,
        choosePhysicalNet: 'datacentre'
      }, {
        vlanReg: /^(1\d{2}|200)$/,
        choosePhysicalNet: 'datacentre2'
      }];
      let testVlan;
      switch (field) {
        case 'create_subnet':
          refs.subnet_name.setState({
            hide: !subnetChecked
          });
          refs.net_address.setState({
            hide: !subnetChecked
          });
          refs.btn.setState({
            disabled: subnetChecked
          });
          break;
        case 'vlan_id':
          if (enableType === 'vlan') {
            vlanStatus.forEach((m) => {
              if (m.choosePhysicalNet === phyiscalNet) {
                testVlan = m.vlanReg;
                chooseVlan(refs, vlanState, testVlan, testAddr, netVlanstate, subnetChecked);
              }
            });
            refs.select_physical_network.setState({
              hide: false
            });
          }
          break;
        case 'physical_network':
          if (enableType === 'flat') {
            chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr);
            refs.select_physical_network.setState({
              hide: true
            });
          }
          break;
        case 'enable_vlan':
          switch (enableType) {
            case 'vlan':
              refs.vlan_id.setState({
                hide: false
              });
              refs.physical_network.setState({
                hide: true
              });
              vlanStatus.forEach((m) => {
                if (m.choosePhysicalNet === phyiscalNet) {
                  testVlan = m.vlanReg;
                  chooseVlan(refs, vlanState, testVlan, testAddr, netVlanstate, subnetChecked);
                }
              });
              if (!subnetChecked) {
                refs.btn.setState({
                  disabled: true
                });
              }
              break;
            case 'vxlan':
              if (subnetChecked && testAddr.test(netVlanstate.value)) {
                refs.btn.setState({
                  disabled: netVlanstate.value === ''
                });
              } else if (!subnetChecked) {
                refs.btn.setState({
                  disabled: false
                });
              }
              refs.vlan_id.setState({
                hide: true
              });
              refs.physical_network.setState({
                hide: true
              });
              refs.select_physical_network.setState({
                hide: true
              });
              break;
            case 'flat':
              if (enableType === 'flat') {
                chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr);
              }
              refs.vlan_id.setState({
                hide: true
              });
              refs.physical_network.setState({
                hide: false
              });
              refs.select_physical_network.setState({
                hide: true
              });
              break;
            default:
              break;
          }
          break;
        case 'select_physical_network':
          if (phyiscalNet === 'datacentre2') {
            refs.vlan_id.setState({
              tip_info: 'vlan_tip_two'
            });
          } else if (phyiscalNet === 'datacentre') {
            refs.vlan_id.setState({
              tip_info: 'vlan_tip'
            });
          }
          vlanStatus.forEach((m) => {
            if (m.choosePhysicalNet === phyiscalNet) {
              testVlan = m.vlanReg;
              chooseVlan(refs, vlanState, testVlan, testAddr, netVlanstate, subnetChecked);
            }
          });
          break;
        case 'net_address':
          if(refs.create_subnet.state.checked) {
            if (!testAddr.test(netVlanstate.value)) {
              if(netVlanstate.value !== '') {
                refs.net_address.setState({
                  error: true
                });
                refs.btn.setState({
                  disabled: true
                });
              } else {
                refs.net_address.setState({
                  error: false
                });
                refs.btn.setState({
                  disabled: true
                });
              }
            } else {
              refs.net_address.setState({
                error: false
              });
              if (enableType === 'vxlan') {
                refs.btn.setState({
                  disabled: false
                });
              } else if (enableType === 'vlan') {
                vlanStatus.forEach((m) => {
                  if (m.choosePhysicalNet === phyiscalNet) {
                    testVlan = m.vlanReg;
                    if (!testVlan.test(vlanState.value)) {
                      refs.vlan_id.setState({
                        error: vlanState.value !== ''
                      });
                      refs.btn.setState({
                        disabled: true
                      });
                    } else if (vlanState.value !== '' && netVlanstate.value === ''){
                      refs.btn.setState({
                        disabled: true
                      });
                    } else {
                      if(netVlanstate && vlanState) {
                        refs.btn.setState({
                          disabled: false
                        });
                      }
                    }
                  }
                });
              } else {
                if (!testFlat.test(flatState.value)) {
                  refs.btn.setState({
                    disabled: true
                  });
                  refs.physical_network.setState({
                    error: flatState.value !== ''
                  });
                } else if (vlanState.value !== '' && netVlanstate.value === ''){
                  refs.btn.setState({
                    disabled: true
                  });
                  refs.vlan_id.setState({
                    error: false
                  });
                } else {
                  refs.physical_network.setState({
                    error: false
                  });

                  if(netVlanstate && flatState) {
                    refs.btn.setState({
                      disabled: false
                    });
                  }
                }
                refs.vlan_id.setState({
                  hide: true
                });
                refs.physical_network.setState({
                  hide: false
                });
              }
            }
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
