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
  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSecuritygroupList().then((data) => {
        if(data.securitygroup.length > 0) {
          let segroup = copyObj(data);
          let securitygroups = segroup.securitygroup;
          request.getPortListById(obj.vip_port_id).then((res) => {
            res.port.security_groups.forEach((i) => {
              securitygroups.some((s) => {
                if (s.id === i) {
                  s.selected = true;
                  return true;
                }
                return false;
              });
            });
            refs.security_group.setState({
              data: securitygroups,
              value: securitygroups[0].id,
              hide: false
            }, () => {
              refs.btn.setState({
                disabled: false
              });
            });
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data = {
        port: {
          security_groups: []
        }
      };

      refs.security_group.state.data.forEach(function(ele) {
        ele.selected && data.port.security_groups.push(ele.id);
      });
      if(!obj.vip_port_id) {
        refs.security_group_info.setState({
          hide: false
        });
      }

      request.editSecurityGroup(data, obj.vip_port_id).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
    }
  };

  commonModal(props);
}

module.exports = pop;
