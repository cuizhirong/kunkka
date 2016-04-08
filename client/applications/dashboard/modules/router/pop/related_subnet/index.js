var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function pop(obj, parent, callback) {
  var subnets = copyObj(obj.subnet);
  var subnetGroup = [],
    hasAvailableSubnet = false;
  subnets.forEach((s) => {
    if (s.router.id) {
      s.disabled = true;
    } else if (s.gateway_ip === null) {
      s.disabled = true;
    } else {
      hasAvailableSubnet = true;
    }
  });

  if (hasAvailableSubnet) {
    subnets.forEach((subnet) => {
      if (!subnet.network.shared) {
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
            name: subnet.network.name || '(' + subnet.network.id.substr(0, 8) + ')',
            data: [subnet]
          });
        }
      }
    });
  }

  config.fields[0].text = obj.rawItem.name || '(' + obj.rawItem.id.substr(0, 8) + ')';
  config.fields[1].data = subnetGroup;
  subnets.some((s) => {
    if (!s.disabled) {
      config.fields[1].value = s.id;
      return true;
    }
    return false;
  });

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.addInterface(obj.rawItem.id, {
        subnet_id: refs.subnet.state.value
      }).then((res) => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
