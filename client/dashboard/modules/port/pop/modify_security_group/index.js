var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('client/dashboard/modules/port/request');
var createSecurityGroup = require('client/dashboard/modules/security-group/pop/create_security_group/index');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getSecuritygroupList().then((data) => {
        if(data.securitygroup.length > 0) {
          refs.security_group.setState({
            data: data.securitygroup,
            value: data.securitygroup[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        port: {
          security_groups: []
        }
      };

      refs.security_group.state.data.forEach(function(ele) {
        ele.selected && data.port.security_groups.push(ele.id);
      });
      request.editSecurityGroup(data, obj.id).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'security_group':
          if(refs.security_group.state.clicked) {
            createSecurityGroup((res) => {
              refs.security_group.setState({
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
