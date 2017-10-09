let commonModal = require('client/components/modal_common/index');
let config = require('./config.json');
let request = require('../../request');
let addHostroutes = require('./add_hostroutes');
let __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  if(obj && obj.hasOwnProperty('subnets')) {
    config.fields[1].value = obj.id;
    config.fields[1].disabled = true;
    config.fields[2].value = obj.project_id;
    config.fields[2].disabled = true;
  } else {
    config.fields[1].value = '';
    config.fields[1].disabled = false;
    config.fields[2].value = '';
    config.fields[2].disabled = false;
  }
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.add_hostroutes.setState({
        renderer: addHostroutes,
        objHostRoutes: []
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        ip_version: 4,
        name: refs.subnet_name.state.value,
        network_id: refs.input_network.state.value,
        project_id: refs.project_id.state.value,
        cidr: refs.net_address.state.value,
        enable_dhcp: refs.enable_dhcp.state.checked,
        host_routes: []
      };

      let gwChecked = refs.enable_gw.state.checked;
      if (!gwChecked) {
        data.gateway_ip = null;
      } else {
        if (refs.gw_address.state.value) {
          data.gateway_ip = refs.gw_address.state.value;
        }

        let dns1 = refs.subnet_dns1.state.value;
        let dns2 = refs.subnet_dns2.state.value;
        if (dns1 || dns2) {
          let dns = [];
          dns1 && dns.push(dns1);
          dns2 && dns.push(dns2);
          data.dns_nameservers = dns;
        }
      }
      let hostroutes = refs.add_hostroutes.refs.hostroutes.state.showsubs;
      hostroutes.forEach((m) => {
        data.host_routes.push({
          destination: m.destination,
          nexthop: m.nexthop
        });
      });
      request.createSubnet(data).then((res) => {
        callback && callback(res.subnet);
        cb(true);
      }).catch((err) => {
        let reg = new RegExp('"message":"(.*)","');
        let tip = reg.exec(err.response)[1];

        refs.error.setState({
          value: tip,
          hide: false
        });
        cb(false);
      });
    },
    onAction: function(field, status, refs) {
      let netState = refs.net_address.state,
        networkState = refs.input_network.state.value,
        projectId = refs.project_id.state.value,
        testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
      switch (field) {
        case 'enable_gw':
          refs.gw_address.setState({
            disabled: !refs.enable_gw.state.checked
          });
          break;
        case 'show_more':
          refs.enable_gw.setState({
            hide: !status.checked
          });
          refs.gw_address.setState({
            hide: !status.checked
          });
          refs.enable_dhcp.setState({
            hide: !status.checked
          });
          refs.subnet_dns1.setState({
            hide: !status.checked
          });
          refs.subnet_dns2.setState({
            hide: !status.checked
          });
          refs.add_hostroutes.setState({
            hide: !status.checked
          });
          break;
        case 'input_network':
          if(testAddr.test(netState.value) && networkState !== '' && projectId !== '') {
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.btn.setState({
              disabled: true
            });
          }
          break;
        case 'project_id':
          if(testAddr.test(netState.value) && networkState !== '' && projectId !== '') {
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.btn.setState({
              disabled: true
            });
          }
          break;
        case 'net_address':
          if(!testAddr.test(netState.value)) {
            refs.net_address.setState({
              error: netState.value !== ''
            });
            refs.btn.setState({
              disabled: true
            });
          } else {
            if(testAddr.test(netState.value) && networkState !== '' && projectId !== '') {
              refs.btn.setState({
                disabled: false
              });
              refs.net_address.setState({
                error: false
              });
            } else {
              refs.btn.setState({
                disabled: true
              });
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
