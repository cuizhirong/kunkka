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
        createItem.network_type = 'vlan';
        let v = refs.vlan_id.state.value.trim();
        if (v !== '') {
          createItem.segmentation_id = v;
          createItem.physical_network = 'physnet3';
        }
      }

        configCreate.push(createItem);
        data.description = refs.apply_description.state.value;

      if (!refs.enable_security.state.checked) {
        data.port_security_enabled = false;
      }

      if(refs.apply_subnet.state.checked) {
        var netAddr = refs.net_address.state.value,
          testAddr = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/;
        if(!testAddr.test(netAddr)) {
          refs.net_address.setState({
            error: true
          });
        } else {
          request.createNetwork(data).then((res) => {
            var sub_data = {};
            sub_data.detail = {};
            var sub_createDetail = sub_data.detail;

            sub_createDetail.create = [];
            var sub_configCreate = sub_createDetail.create;
            var sub_createItem = {};
            sub_createItem = {
              _type: 'Subnet',
              _identity: 'netSub',
              ip_version: 4,
              name: refs.subnet_name.state.value,
              network_id: res.id,
              cidr: refs.net_address.state.value,
              enable_dhcp: true
            };
            sub_configCreate.push(sub_createItem);
            sub_data.description = refs.description.state.value;
            request.createSubnet(sub_data).then(() => {
              callback && callback(res.network);
              cb(true);
            });
          });
        }
      } else {
        request.createNetwork(data).then((res) => {
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
        disabled: !flag
      }); 
    }
  };

  commonModal(props);
}

module.exports = pop;
