var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var Request = require('../../../port/request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      var subnetGroup = [];
      Request.getSubnetSGList().then((data) => {
        var subnets = data.subnet.filter((sub) => sub.network['router:external'] === false);
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
        }

        if (subnets.length > 0) {
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var lbParam = {
        name: refs.name.state.value ? refs.name.state.value : '',
        vip_subnet_id: refs.subnet.state.value,
        tenant_id: HALO.user.projectId,
        description: refs.desc.state.value
      };

      request.createLb(lbParam).then(res => {
        callback && callback(res);
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
