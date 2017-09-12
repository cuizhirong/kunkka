const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');

const copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};
function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;
  let ports = [],
    securityGroups = [];
  let addresses = obj.addresses;

  for (let key in addresses) {
    for (let ele of addresses[key]) {
      if (ele['OS-EXT-IPS:type'] === 'fixed') {
        ports.push({
          id: ele.port.id,
          name: ele.addr,
          'security_groups': ele.security_groups
        });
      }
    }
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if(ports.length > 0) {
        refs.port.setState({
          data: ports,
          value: ports[0].id
        });

        request.getSecuritygroupList().then((data) => {
          if(data.length > 0) {
            let res = copyObj(data);
            securityGroups = copyObj(data);
            ports[0].security_groups.forEach((item) => {
              res.some((r) => {
                if (r.name === item.name) {
                  r.selected = true;
                  return true;
                }
                return false;
              });
            });
            refs.security_group.setState({
              data: res,
              value: res[0].id
            });
          }
        });

        refs.btn.setState({
          disabled: false
        });
      }
    },
    onConfirm: function(refs, cb) {
      let data = {
        port: {
          security_groups : []
        }
      };
      refs.security_group.state.data.some(function(ele) {
        if(ele.selected) {
          data.port.security_groups.push(ele.id);
        }
      });
      request.updateSecurity(refs.port.state.value, data).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'security_group':
          let hasSecurity = state.data.some((item) => {
            if (item.selected) {
              return true;
            }
            return false;
          });
          refs.btn.setState({
            disabled: !hasSecurity
          });
          break;
        case 'port':
          ports.some((item) => {
            if (item.id === state.value) {
              let sgs = copyObj(securityGroups);
              item.security_groups.forEach((ele) => {
                sgs.some((s) => {
                  if (ele.name === s.name) {
                    s.selected = true;
                    return true;
                  }
                  return false;
                });
              });
              refs.security_group.setState({
                data: sgs
              });
              return true;
            }
            return false;
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
