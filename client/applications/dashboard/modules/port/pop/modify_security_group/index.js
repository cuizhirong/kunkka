const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('client/applications/dashboard/modules/port/request');
const createSecurityGroup = require('client/applications/dashboard/modules/security-group/pop/create_security_group/index');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSecuritygroupList().then((data) => {
        if(data.securitygroup.length > 0) {
          let securitygroups = data.securitygroup;
          obj.security_groups.forEach((item) => {
            securitygroups.some((s) => {
              if (s.id === item.id) {
                s.selected = true;
                return true;
              }
              return false;
            });
          });
          refs.security_group.setState({
            data: securitygroups,
            value: securitygroups[0].id
          });
          refs.btn.setState({
            disabled: false
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
      request.editSecurityGroup(data, obj.id).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'security_group':
          if(refs.security_group.state.clicked) {
            createSecurityGroup(refs.modal, (res) => {
              refs.security_group.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
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
