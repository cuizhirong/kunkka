var commonModal = require('client/components/modal_common/index');
var createSubnet = require('../../../subnet/pop/create_subnet/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

var getAvailableSubnets = function(data, refs) {
  var subnets = data.filter((ele) => !ele.network['router:external']);
  var subnetGroup = [],
    hasAvailableSubnet = false;
  subnets.forEach((s) => {
    if (s.router.id) {
      s.disabled = true;
    } else if (s.gateway_ip === null) {
      s.disabled = true;
    } else {
      if(!s.network.shared) {
        hasAvailableSubnet = true;
      }
    }
  });

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

  if (hasAvailableSubnet) {
    if(hasAvailableSubnet) {
      refs.btn.setState({
        disabled: false
      });
    }
  }
  subnets.some((s) => {
    if (!s.disabled && !s.network.shared) {
      refs.subnet.setState({
        value: s.id
      });
      return true;
    }
    return false;
  });

  return subnetGroup;
};

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSubnets(false).then(res => {
        var mySubnets = getAvailableSubnets(res, refs);
        refs.subnet.setState({
          data: mySubnets
        });
      });
    },
    onConfirm: function(refs, cb) {
      request.addInterface(obj.id, {
        subnet_id: refs.subnet.state.value
      }).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'subnet':
          if(status.clicked === true && refs.subnet.state.data.length === 0) {
            refs.subnet.setState({
              clicked: false
            });
            createSubnet(null, null, function() {
              request.getSubnets(true).then(res => {
                var mySubnets = getAvailableSubnets(res, refs);
                refs.subnet.setState({
                  data: mySubnets
                });
              });
            });
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
