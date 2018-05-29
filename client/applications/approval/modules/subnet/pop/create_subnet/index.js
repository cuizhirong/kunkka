const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');


const subnetDescription = require('../subnet_description/index');

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getNetworks().then((data) => {
        if (data.length > 0) {
          let selectedItem = data[0].id;
          if (obj && obj.id) {
            selectedItem = obj.id;
          }
          let networks = [];
          data.forEach((ele) => {
            if (!ele.shared) {
              networks.push(ele);
            }
          });
          refs.select_network.setState({
            data: networks,
            value: selectedItem
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data = {};
      data.detail = {};
      let createDetail = data.detail;

      createDetail.create = [];
      let configCreate = createDetail.create;
      let createItem = {};

      createItem = {
        _type: 'Subnet',
        _identity  : 'subnet',
        ip_version: 4,
        name: refs.subnet_name.state.value,
        network_id: refs.select_network.state.value,
        cidr: refs.net_address.state.value,
        enable_dhcp: refs.enable_dhcp.state.checked
      };

      let gwChecked = refs.enable_gw.state.checked;
      if (!gwChecked) {
        createItem.gateway_ip = null;
      } else {
        if (refs.gw_address.state.value) {
          createItem.gateway_ip = refs.gw_address.state.value;
        }

        let dns1 = refs.subnet_dns1.state.value;
        let dns2 = refs.subnet_dns2.state.value;
        if (dns1 || dns2) {
          let dns = [];
          dns1 && dns.push(dns1);
          dns2 && dns.push(dns2);
          createItem.dns_nameservers = dns;
        }
      }

      configCreate.push(createItem);

      let netAddr = refs.net_address.state.value,
        testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
      if(!testAddr.test(netAddr)) {
        refs.net_address.setState({
          error: true
        });
      } else {
        subnetDescription(data, refs.modal);
      }
    },
    onAction: function(field, status, refs) {
      let netState = refs.net_address.state;
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
          break;
        case 'net_address':
          if(netState.error === true && netState.value === '') {
            refs.net_address.setState({
              error: false
            });
          }
          break;
        default:
          break;
      }
      refs.btn.setState({
        disabled: !(!netState.error && netState.value)
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
