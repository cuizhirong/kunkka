const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const networkType = require('./network_type');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function chooseVlan(refs, vlanState, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength){
  let vlanNumber = parseInt(vlanState.value, 10);
  if (/^[0-9]*$/.test(vlanState.value)) {
    if (!(vlanNumber >= testMin && vlanNumber <= testMax)) {
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
        if(testAddr.test(netVlanstate.value, 10) && (vlanNumber > testMin && vlanNumber < testMax)) {
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
  } else {
    refs.vlan_id.setState({
      error: true
    });
  }
  if (vlanLength === 1) {
    refs.select_physical_network.setState({
      hide: true
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
  if(HALO.user.roles.indexOf('admin') === -1) {
    delete config.fields[6];
  }
  let phyNet = HALO.configs.neutron_network_vlanranges;
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs, field) {
      refs.enable_vlan && refs.enable_vlan.setState({
        renderer: networkType
      });

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
      if (refs.enable_vlan) {
        let netType = refs.enable_vlan.refs.enable_type.state.selectedValue;
        switch(netType) {
          case 'vlan':
            data['provider:network_type'] = 'vlan';
            refs.vlan_id.setState({
              hide: false
            });
            let vId = refs.vlan_id.state.value;
            let physicalNetwork = refs.select_physical_network.state.value;
            if(phyNet.length === 1) {
              data['provider:physical_network'] = phyNet[0].split(':')[0];
            }
            data['provider:segmentation_id'] = vId;
            data['provider:physical_network'] = physicalNetwork;
            refs.btn.setState({
              disabled: true
            });
            break;
          case 'vxlan':
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
        testFlat = /^\w+$/;
      let phyiscalNet = refs.select_physical_network.state.value;
      let vlanLength = phyNet.length;

      let enableType = refs.enable_vlan && refs.enable_vlan.refs.enable_type.state.selectedValue;
      let vlanItem = [];
      let testMin, testMax;
      phyNet.forEach(item => {
        vlanItem.push(item.split(':'));
      });
      if (HALO.user.roles.indexOf('admin') === -1) {
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
      }
      switch (field) {
        case 'create_subnet':
          refs.subnet_name.setState({
            hide: !subnetChecked
          });
          refs.net_address.setState({
            hide: !subnetChecked
          });
          refs.btn.setState({
            disabled: vlanState.value === ''
          });
          if(enableType && enableType === 'vxlan' && !subnetChecked) {
            refs.btn.setState({
              disabled: false
            });
          }
          break;
        case 'vlan_id':
          if (enableType && enableType === 'vlan') {
            vlanItem.forEach((m) => {
              if (m[0] === phyiscalNet) {
                testMin = m[1];
                testMax = m[2];
                chooseVlan(refs, vlanState, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength);
              }
            });
            refs.select_physical_network.setState({
              hide: false
            });
            if (vlanLength === 1) {
              refs.select_physical_network.setState({
                hide: true
              });
            }
          }
          if(enableType && enableType === 'vxlan' && !subnetChecked) {
            refs.btn.setState({
              disabled: false
            });
          }
          break;
        case 'physical_network':
          if (enableType && enableType === 'flat') {
            chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr);
            refs.select_physical_network.setState({
              hide: true
            });
          }
          break;
        case 'enable_vlan':
          switch (enableType && enableType) {
            case 'vlan':
              refs.vlan_id.setState({
                hide: false
              });
              refs.physical_network.setState({
                hide: true
              });
              vlanItem.forEach((m) => {
                if (m[0] === phyiscalNet) {
                  testMin = m[1];
                  testMax = m[2];
                  chooseVlan(refs, vlanState, testMin, testMax, testAddr, netVlanstate, subnetChecked);
                }
              });
              if (!subnetChecked) {
                refs.vlan_id.setState({
                  error: false
                });
                refs.btn.setState({
                  disabled: vlanState.value === ''
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
              refs.btn.setState({
                disabled: vlanState.value === ''
              });
              break;
            default:
              break;
          }
          break;
        case 'select_physical_network':
          vlanItem.forEach((m) => {
            if (m[0] === phyiscalNet) {
              testMin = m[1];
              testMax = m[2];
              refs.vlan_id.setState({
                tip_info: __.vlan_tip.replace('{0}', testMin).replace('{1}', testMax)
              });
              chooseVlan(refs, vlanState, testMin, testMax, testAddr, netVlanstate, subnetChecked);
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
              if (enableType && enableType === 'vxlan') {
                refs.btn.setState({
                  disabled: false
                });
              } else if (enableType && enableType === 'vlan') {
                vlanItem.forEach((m) => {
                  if (m[0] === phyiscalNet) {
                    if (m[0] === phyiscalNet) {
                      testMin = m[1];
                      testMax = m[2];
                      if(!(typeof parseInt(vlanState.value, 10) === 'number' && vlanState.value >= testMin && vlanState.value <= testMax)){
                        refs.btn.setState({
                          disabled: true
                        });
                        refs.vlan_id.setState({
                          error: vlanState.value !== ''
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
