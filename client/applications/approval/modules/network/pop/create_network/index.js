var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');

function pop(parent, callback) {
  if (!HALO.settings.is_show_vlan) {
    config.fields[2].hide = true;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {};
      data.detail = {};
      var createDetail = data.detail;

      createDetail.create = [];
      var configCreate = createDetail.create;
      var createItem = {};

      createItem = {
        _type: 'Network',
        _identity: 'net',
        name: refs.network_name.state.value
      };

      // check vlan
      if (refs.enable_vlan.state.checked) {
        // create resource by restful api, not heat
        createDetail.type = 'direct';
        createDetail.resourceType = 'network';
        createItem['provider:network_type'] = 'vlan';
        let v = refs.vlan_id.state.value.trim();
        if (v !== '') {
          createItem['provider:segmentation_id'] = v;
          createItem['provider:physical_network'] = 'physnet3';
        }
      }

      if (!refs.enable_security.state.checked) {
        createItem.port_security_enabled = false;
      }

      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;

      if(refs.apply_subnet.state.checked) {
        var subCreateItem = {};
        subCreateItem = {
          _type: 'Subnet',
          _identity: 'subnet',
          ip_version: 4,
          name: refs.subnet_name.state.value,
          network_id: {get_resource: '_net'},
          cidr: refs.net_address.state.value,
          enable_dhcp: true
        };
        configCreate.push(subCreateItem);
        request.createApplication(data).then((res) => {
          callback && callback(res.network);
          cb(true);
        });
      } else {
        request.createApplication(data).then((res) => {
          callback && callback(res.network);
          cb(true);
        });
      }
    },
    onAction: function(field, status, refs) {
      var subnetChecked = refs.apply_subnet.state.checked;
      var netState = refs.net_address.state;
      var flag = (subnetChecked && netState.value && !netState.error) || !subnetChecked;
      switch (field) {
        case 'apply_subnet':
          refs.subnet_name.setState({
            hide: !subnetChecked
          });
          refs.net_address.setState({
            hide: !subnetChecked
          });
          break;
        case 'enable_vlan':
          refs.vlan_id.setState({
            hide: !refs.enable_vlan.state.checked
          });
          break;
        case 'net_address':
          var testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
          if(refs.apply_subnet.state.checked) {
            if(!testAddr.test(netState.value)) {
              if(netState.value !== '') {
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
              refs.btn.setState({
                disabled: false
              });
            }
          }
          break;
        default:
          break;
      }

      refs.btn.setState({
        disabled: !flag
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
