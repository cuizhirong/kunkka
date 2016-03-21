var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

var createSubnet = require('client/dashboard/modules/subnet/pop/create_subnet/index');

function pop(obj, callback, parent) {
  var getSubnetGroup = function(subnets) {
    var subnetArray = [];
    subnets.map((subnet, i) => {
      if(subnetArray.length === 0) {
        subnetArray.push({
          value: i,
          name: subnet.network.name,
          data: [{
            id: i,
            name: subnet.name + '(' + subnet.cidr + ')'
          }]
        });
      } else {
        var duplication = false;
        subnetArray.forEach((ele) => {
          if(ele.name === subnet.network.name) {
            duplication = duplication || true;
            ele.data.push({
              id: i,
              name: subnet.name + '(' + subnet.cidr + ')'
            });
          } else {
            duplication = duplication || false;
          }
        });
        if(!duplication) {
          subnetArray.push({
            value: i,
            name: subnet.network.name,
            data: [{
              id: i,
              name: subnet.name + '(' + subnet.cidr + ')'
            }]
          });
        }
      }
    });
    return subnetArray;
  };

  config.fields[0].text = obj.rawItem.name;
  config.fields[1].data = getSubnetGroup(obj.subnet);

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSubnets().then((res) => {
        if (res.length > 0) {
          refs.subnet.setState({
            data: res,
            value: res[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.addInterface(obj.id, {
        subnet_id: refs.subnet.state.value
      }).then((res) => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'subnet':
          if (refs.subnet.state.clicked) {
            createSubnet(null, (res) => {
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
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
