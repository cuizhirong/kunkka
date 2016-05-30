var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var createSubnet = require('client/applications/dashboard/modules/subnet/pop/create_subnet/index');
var createSecurityGroup = require('client/applications/dashboard/modules/security-group/pop/create_security_group/index');
var __ = require('locale/client/dashboard.lang.json');

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function pop(obj, parent, callback) {
  if (obj) {
    config.title[0] = 'add_';
  } else {
    config.title[0] = 'create';
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      var subnetGroup = [];
      request.getSubnetList().then((data) => {
        var subnets = copyObj(data.subnet);
        if (subnets.length > 0) {
          subnets.forEach((subnet) => {
            var hasGroup = subnetGroup.some((group) => {
              if (group.id === subnet.network_id) {
                group.data.push(subnet);
                return true;
              }
              return false;
            });
            if (!hasGroup) {
              subnetGroup.push({
                id: subnet.network_id,
                name: subnet.network.name,
                port_security_enabled: subnet.network.port_security_enabled,
                shared: subnet.network.shared,
                data: [subnet]
              });
            }
          });

          var selectedSubnet = subnetGroup.length > 0 ? subnetGroup[0].data[0] : null;
          selectedSubnet = obj ? obj : selectedSubnet;
          refs.subnet.setState({
            data: subnetGroup,
            value: selectedSubnet ? selectedSubnet.id : null
          });
          refs.security_group.setState({
            hide: selectedSubnet ? !selectedSubnet.network.port_security_enabled : false
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });

      request.getSecuritygroupList().then((data) => {
        if (data.securitygroup.length > 0) {
          var securitygroups = [],
            defaultSecurity;
          copyObj(data.securitygroup).forEach((item) => {
            if (item.name === 'default') {
              defaultSecurity = item;
              defaultSecurity.selected = true;
            } else {
              securitygroups.push(item);
            }
          });
          securitygroups.unshift(defaultSecurity);

          refs.security_group.setState({
            data: securitygroups
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var port = {
        name: refs.name.state.value,
        network_id: '',
        security_groups: [],
        fixed_ips: [{
          subnet_id: refs.subnet.state.value
        }]
      };

      var subnet = refs.subnet.state;

      var shared = false;
      subnet.data.some((ele) => {
        return ele.data.some((s) => {
          if (s.id === subnet.value) {
            port.network_id = ele.id;
            port.port_security_enabled = ele.port_security_enabled;
            shared = ele.shared;
            return true;
          }
          return false;
        });
      });

      if (port.port_security_enabled) {
        refs.security_group.state.data.forEach(function(ele) {
          ele.selected && port.security_groups.push(ele.id);
        });
      }

      if (!shared && refs.address_ip.state.value !== '') {
        port.fixed_ips[0].ip_address = '';
        port.fixed_ips[0].ip_address = refs.address_ip.state.value;
      }

      request.createPort(port).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'subnet':
          if (refs.subnet.state.clicked) {
            createSubnet(refs.modal, (res) => {
              refs.subnet.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
              });
            }, refs.modal);
          } else {
            var portSecurityEnabled = true;
            status.data.some((group) => {
              return group.data.some((s) => {
                if (s.id === status.value) {
                  portSecurityEnabled = group.port_security_enabled;
                  return true;
                }
                return false;
              });
            });
            refs.security_group.setState({
              hide: !portSecurityEnabled
            });
          }
          break;
        case 'security_group':
          if (refs.security_group.state.clicked) {
            createSecurityGroup(refs.modal, (res) => {
              refs.security_group.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
              });
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
