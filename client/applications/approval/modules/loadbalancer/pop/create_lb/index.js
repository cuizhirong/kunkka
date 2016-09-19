var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var Request = require('../../../port/request');
var __ = require('locale/client/approval.lang.json');

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
      var data = {};
      data.description = refs.apply_description.state.value;
      data.detail = {};
      data.detail.create = [];

      var createDetail = data.detail.create;
      data.detail.type = 'direct';
      data.detail.resourceType = 'loadBalancer';
      var lbParam = {
        _type: 'LoadBalancer',
        _identity: 'lb',
        name: refs.name.state.value ? refs.name.state.value : '',
        vip_subnet_id: refs.subnet.state.value,
        description: refs.desc.state.value
      };
      createDetail.push(lbParam);

      request.createApplication(data).then(res => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
