const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const Request = require('../../../port/request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  let enableCharge = HALO.settings.enable_charge;
  if(obj) {
    config.fields[3].hide = true;
    config.title = ['modify', 'load', 'balancer'];
    config.btn.value = 'modify';
  } else {
    config.fields[3].hide = !enableCharge;
    config.title = ['create', 'load', 'balancer'];
    config.btn.value = 'create';
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      function setPrice() {
        let price = HALO.prices ? Math.max.apply(null, HALO.prices.other['lbass.loadbalancer']).toFixed(4) : 0;

        refs.charge.setState({
          value: price
        });
      }
      if(enableCharge) {
        setPrice();
      }
      let subnetGroup = [];
      Request.getSubnetSGList().then((data) => {
        let subnets = data.subnet.filter((sub) => sub.network['router:external'] === false);
        if (subnets.length > 0) {
          subnets.forEach((subnet) => {
            let hasGroup = subnetGroup.some((group) => {
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
                shared: subnet.network.shared,
                data: [subnet]
              });
            }
          });

          let selectedSubnet = subnetGroup.length > 0 ? subnetGroup[0].data[0] : null;
          if(obj) {
            refs.name.setState({
              value: obj.name
            });
            refs.desc.setState({
              value: obj.description
            });
            refs.subnet.setState({
              data: subnetGroup,
              value: obj.vip_subnet_id,
              disabled: true
            });
          } else {
            refs.subnet.setState({
              data: subnetGroup,
              value: selectedSubnet ? selectedSubnet.id : null
            });
          }
        }

        if (subnets.length > 0) {
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let lbParam = {};

      if(obj) {
        lbParam = {
          name: refs.name.state.value ? refs.name.state.value : '',
          description: refs.desc.state.value
        };
        request.updateLb(obj.id, lbParam).then(res => {
          callback && callback(res);
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error));
        });
      } else {
        lbParam = {
          name: refs.name.state.value ? refs.name.state.value : '',
          vip_subnet_id: refs.subnet.state.value,
          description: refs.desc.state.value
        };
        request.createLb(lbParam).then(res => {
          callback && callback(res);
          cb(true);
        }).catch(function(error) {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
