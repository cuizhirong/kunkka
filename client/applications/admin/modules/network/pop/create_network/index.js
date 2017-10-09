const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const networkType = require('./network_type');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function chooseVlan(refs, vlanNumber, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength, projectState, testProject){
  if (!(/^[0-9]*$/.test(refs.vlan_id.state.value) && vlanNumber >= testMin && vlanNumber <= testMax)) {
    refs.btn.setState({
      disabled: true
    });
    refs.vlan_id.setState({
      error: refs.vlan_id.state.value !== ''
    });
  } else {
    refs.vlan_id.setState({
      error: false
    });
  }
  if (subnetChecked) {
    if (testProject.test(projectState) && testAddr.test(netVlanstate.value) && /^[0-9]*$/.test(vlanNumber) && vlanNumber >= testMin && vlanNumber <= testMax) {
      refs.btn.setState({
        disabled: !(vlanNumber !== '' && projectState !== '' && netVlanstate.value !== '')
      });
    } else {
      refs.btn.setState({
        disabled: true
      });
    }
  } else {
    if (testProject.test(projectState) && /^[0-9]*$/.test(vlanNumber) && vlanNumber >= testMin && vlanNumber <= testMax) {
      refs.btn.setState({
        disabled: !(vlanNumber !== '' && projectState !== '')
      });
    } else {
      refs.btn.setState({
        disabled: true
      });
    }
  }
  if (vlanLength === 1) {
    refs.select_physical_network.setState({
      hide: true
    });
  }
  if (vlanLength === 0) {
    refs.select_physical_network.setState({
      hide: true
    });
    refs.vlan_id.setState({
      hide: true
    });
  }
}
function chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr, projectState, testProject) {

  if (!testFlat.test(flatState.value)) {
    refs.btn.setState({
      disabled: true
    });
    refs.physical_network.setState({
      error: flatState.value !== ''
    });
  }
  if(subnetChecked) {
    if (testFlat.test(flatState.value) && testProject.test(projectState) && testAddr.test(netVlanstate.value)) {
      refs.btn.setState({
        disabled: !(flatState.value !== '' && projectState !== '' && netVlanstate.value !== '')
      });
    }
  } else {
    if (testFlat.test(flatState.value) && testProject.test(projectState)) {
      refs.btn.setState({
        disabled: !(flatState.value !== '' && projectState !== '')
      });
    }
  }
}

function pop(parent, callback) {
  if (!HALO.settings.is_show_vlan) {
    config.fields[2].hide = true;
  }
  let phyNet;
  if(typeof HALO.configs.neutron_network_vlanranges === 'string') {
    phyNet = HALO.configs.neutron_network_vlanranges.split(',');
  } else if (typeof HALO.configs.neutron_network_vlanranges === 'object' && HALO.configs.neutron_network_vlanranges.constructor === Array){
    phyNet = HALO.configs.neutron_network_vlanranges;
  } else {
    phyNet = [];
  }
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs, field) {
      refs.enable_vlan && refs.enable_vlan.setState({
        renderer: networkType
      });

      let phyItem;
      if (phyNet.length !== 0) {
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
      }
    },
    onConfirm: function(refs, cb) {
      let data = {
        name: refs.network_name.state.value
      };
      if (refs.enable_vlan) {
        let netType = refs.enable_vlan.refs.enable_type.state.selectedValue;
        let projectId = refs.project_id.state.value;
        switch(netType) {
          case 'vlan':
            data['provider:network_type'] = 'vlan';
            let vId = refs.vlan_id.state.value;
            let physicalNetwork = refs.select_physical_network.state.value;

            if(phyNet.length === 1) {
              data['provider:physical_network'] = phyNet[0].split(':')[0];
            }
            data['provider:segmentation_id'] = vId;
            data['provider:physical_network'] = physicalNetwork;
            data.project_id = projectId;
            refs.btn.setState({
              disabled: true
            });
            break;
          case 'vxlan':
            data['provider:network_type'] = 'vxlan';
            data.project_id = projectId;
            break;
          case 'flat':
            data['provider:network_type'] = 'flat';
            let physical = refs.physical_network.state.value;
            if(physical !== '') {
              data['provider:physical_network'] = physical;
            }
            data.project_id = projectId;
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
            project_id: refs.project_id.state.value,
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
        projectState = refs.project_id.state.value,
        testProject = /^\w+$/,
        flatState = refs.physical_network.state,
        testFlat = /^\w+$/;
      let phyiscalNet = refs.select_physical_network.state.value;
      let vlanLength = phyNet.length;
      let vlanNumber = parseInt(vlanState.value, 10);

      let enableType = refs.enable_vlan && refs.enable_vlan.refs.enable_type.state.selectedValue;
      let vlanItem = [];
      let testMin, testMax;
      phyNet.forEach(item => {
        vlanItem.push(item.split(':'));
      });
      switch (field) {
        case 'create_subnet':
          refs.subnet_name.setState({
            hide: !subnetChecked
          });
          refs.net_address.setState({
            hide: !subnetChecked
          });
          if (enableType && enableType === 'vxlan') {
            if (testProject.test(projectState)) {
              refs.btn.setState({
                disabled: projectState === ''
              });
            }
          } else if (enableType && enableType === 'vlan') {
            chooseVlan(refs, vlanNumber, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength, projectState, testProject);
          } else {
            chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr, projectState, testProject);
          }

          break;
        case 'vlan_id':
          if (enableType && enableType === 'vlan') {
            vlanItem.forEach((m) => {
              if (m[0] === phyiscalNet) {
                testMin = m[1];
                testMax = m[2];
                chooseVlan(refs, vlanNumber, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength, projectState, testProject);
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
          if (enableType && enableType === 'vxlan') {
            if(testProject.test(projectState)){
              refs.btn.setState({
                disabled: false
              });
            }
          }
          break;
        case 'physical_network':
          if (enableType && enableType === 'flat') {
            chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr, projectState, testProject);
            refs.select_physical_network.setState({
              hide: true
            });
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
              chooseVlan(refs, vlanState, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength, projectState, testProject);
            }
          });
          break;
        case 'project_id':
          if (!testProject.test(projectState)) {
            if(projectState !== '') {
              refs.project_id.setState({
                error: true
              });
              refs.btn.setState({
                disabled: true
              });
            } else {
              refs.project_id.setState({
                error: false
              });
              refs.btn.setState({
                disabled: true
              });
            }
          } else {
            refs.project_id.setState({
              error: false
            });
            if (enableType && enableType === 'vxlan') {
              if(subnetChecked) {
                if (testAddr.test(netVlanstate.value) && testProject.test(projectState)) {
                  refs.btn.setState({
                    disabled: !(netVlanstate.value !== '' && projectState !== '')
                  });
                }
              } else {
                if (testProject.test(projectState)) {
                  refs.btn.setState({
                    disabled: projectState.value === ''
                  });
                }
              }
            } else if (enableType && enableType === 'vlan') {
              vlanItem.forEach((m) => {
                if (m[0] === phyiscalNet) {
                  testMin = m[1];
                  testMax = m[2];
                  refs.vlan_id.setState({
                    tip_info: __.vlan_tip.replace('{0}', testMin).replace('{1}', testMax)
                  });
                  chooseVlan(refs, vlanNumber, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength, projectState, testProject);
                }
              });
              if(vlanLength === 0) {
                refs.btn.setState({
                  disabled: true
                });
              }
            } else if (enableType && enableType === 'flat'){
              chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr, projectState, testProject);
            }
          }
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
                if(testProject.test(projectState) && projectState !== '') {
                  refs.btn.setState({
                    disabled: false
                  });
                }
              } else if (enableType && enableType === 'vlan') {
                vlanItem.forEach((m) => {
                  if (m[0] === phyiscalNet) {
                    testMin = m[1];
                    testMax = m[2];
                    chooseVlan(refs, vlanNumber, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength, projectState, testProject);
                  }
                });
                if (vlanLength === 0) {
                  refs.btn.setState({
                    disabled: true
                  });
                }
              } else if (enableType && enableType === 'flat'){
                chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr, projectState, testProject);
              }
            }
          }
          break;
        case 'enable_vlan':
          switch (enableType) {
            case 'vlan':
              vlanItem.forEach((m) => {
                if (m[0] === phyiscalNet) {
                  testMin = m[1];
                  testMax = m[2];
                  chooseVlan(refs, vlanNumber, testMin, testMax, testAddr, netVlanstate, subnetChecked, vlanLength, projectState, testProject);
                }
              });
              refs.vlan_id.setState({
                hide: false
              });
              refs.physical_network.setState({
                hide: true
              });
              if (phyNet.length === 0) {
                refs.select_physical_network.setState({
                  hide: true
                });
                refs.vlan_id.setState({
                  hide: true
                });
                refs.physical_network.setState({
                  hide: true
                });
              }
              if(vlanLength === 0) {
                refs.btn.setState({
                  disabled: true
                });
              }
              break;
            case 'vxlan':
              if(!subnetChecked) {
                if(testProject.test(projectState)) {
                  refs.btn.setState({
                    disabled: projectState === ''
                  });
                }
              } else {
                if (testAddr.test(netVlanstate.value) && testProject.test(projectState.value)) {
                  refs.btn.setState({
                    disabled: !(netVlanstate.value !== '' && projectState !== '')
                  });
                }
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
              chooseFlat(refs, subnetChecked, netVlanstate, testFlat, flatState, testAddr, projectState, testProject);
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
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
