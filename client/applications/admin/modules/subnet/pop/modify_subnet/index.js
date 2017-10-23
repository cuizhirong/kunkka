const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const addHostroutes = require('../create_subnet/add_hostroutes');
const getErrorMessage = require('client/applications/admin/utils/error_message');
const __ = require('locale/client/admin.lang.json');

function getField(fieldName) {
  let res = null;
  config.fields.some((field) => {
    if (field.field === fieldName) {
      res = field;
      return true;
    }
    return false;
  });
  return res;
}

function pop(obj, parent, callback) {
  getField('subnet_name').value = obj.name;
  getField('gw_address').value = obj.gateway_ip;
  if (!obj.gateway_ip) {
    getField('enable_gw').checked = false;
    getField('gw_address').disabled = true;
  } else {
    getField('enable_gw').checked = true;
    getField('gw_address').disabled = false;
  }
  if (!obj.enable_dhcp) {
    getField('enable_dhcp').checked = false;
  } else {
    getField('enable_dhcp').checked = true;
  }
  if(obj.router.id) {
    getField('gw_address').disabled = true;
  }

  let objDns = obj.dns_nameservers;
  getField('subnet_dns1').value = objDns[0] || '';
  getField('subnet_dns2').value = objDns[1] || '';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.add_hostroutes.setState({
        renderer: addHostroutes,
        objHostRoutes: obj.host_routes
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        name: refs.subnet_name.state.value,
        enable_dhcp: refs.enable_dhcp.state.checked,
        host_routes: []
      };
      if (!refs.enable_gw.state.checked) {
        data.gateway_ip = null;
      } else {
        if(!obj.router.id) {
          data.gateway_ip = refs.gw_address.state.value;
        }
      }

      let dns1 = refs.subnet_dns1.state.value;
      let dns2 = refs.subnet_dns2.state.value;
      if (dns1 || dns2) {
        let dns = [];
        dns1 && dns.push(dns1);
        dns2 && dns.push(dns2);
        data.dns_nameservers = dns;
      }
      let hostroutes = refs.add_hostroutes.refs.hostroutes.state.showsubs;
      hostroutes.forEach((m) => {
        data.host_routes.push({
          destination: m.destination,
          nexthop: m.nexthop
        });
      });
      request.updateSubnet(obj.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'enable_gw':
          refs.gw_address.setState({
            disabled: (obj.router.id ? true : !refs.enable_gw.state.checked)
          });
          break;
        case 'gw_address':
          if (refs.enable_gw.state.checked) {
            refs.btn.setState({
              disabled: !status.value
            });
          } else {
            refs.btn.setState({
              disabled: false
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
