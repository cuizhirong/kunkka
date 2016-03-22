var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

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
            uuid: subnet.id,
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
              uuid: subnet.id,
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
              uuid: subnet.id,
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
          refs.btn.setState({
            disabled: false
          });
          refs.subnet.setState({
            value: res[0].id
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.addInterface(obj.rawItem.id, {
        subnet_id: refs.subnet.state.value
      }).then((res) => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      var index = refs.subnet.state.value,
        allSubnet = [];
      status.data.map(ele => allSubnet.push(...ele.data));
      allSubnet.sort((a, b) => {
        return a.id - b.id;
      });
      refs.subnet.state.value = allSubnet[index].uuid;
    }
  };

  commonModal(props);
}

module.exports = pop;
