let commonModal = require('client/components/modal_common/index');
let config = require('./config.json');
let request = require('../../request');
let addHostroutes = require('./add_hostroutes');
let __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.add_hostroutes.setState({
        renderer: addHostroutes,
        objHostRoutes: []
      });
      request.getNetworks().then((res) => {
        if(res.length > 0) {
          refs.input_network.setState({
            data: res,
            value: res[0].id
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        ip_version: 4,
        name: refs.subnet_name.state.value,
        network_id: refs.input_network.state.value,
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
        testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/,
        networkState = refs.input_network.state.value;
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
          refs.btn.setState({
            disabled: !(testAddr.test(netState.value) && networkState !== '')
          });
          break;
        case 'net_address':
          if(!testAddr.test(netState.value)) {
            refs.net_address.setState({
              error: true
            });
            refs.btn.setState({
              disabled: true
            });
          } else {
            if(testAddr.test(netState.value) && networkState !== '') {
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
