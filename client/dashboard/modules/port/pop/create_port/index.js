var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var createSubnet = require('client/dashboard/modules/subnet/pop/create_subnet/index');
var createSecurityGroup = require('client/dashboard/modules/security-group/pop/create_security_group/index');

function pop(callback, parent) {

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSubnetList().then((data) => {
        if(data.subnet.length > 0) {
          refs.subnet.setState({
            data: data.subnet,
            value: data.subnet[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
      request.getSecuritygroupList().then((data) => {
        if(data.securitygroup.length > 0) {
          refs.security_group.setState({
            data: data.securitygroup,
            value: data.securitygroup[0].id
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
      refs.security_group.state.data.forEach(function(ele) {
        ele.selected && port.security_groups.push(ele.id);
      });
      var subnet = refs.subnet.state;
      subnet.data.forEach((ele) => {
        if(ele.id === subnet.value) {
          port.network_id = ele.network_id;
        }
      });
      if(refs.address_ip.state.value !== '') {
        port.fixed_ips[0].ip_address = '';
        port.fixed_ips[0].ip_address = refs.address_ip.state.value;
      }
      request.createPort(port).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'subnet':
          if(refs.subnet.state.clicked) {
            createSubnet((res) => {
              refs.subnet.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
              });
            }, refs.modal);
          }
          break;
        case 'security_group':
          if(refs.security_group.state.clicked) {
            createSecurityGroup((res) => {
              refs.security_group.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
              });
            }, refs.modal);
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
