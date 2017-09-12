const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, parent, callback) {
  if(obj) {
    config.fields[0].value = obj.name;
    config.fields[1].value = obj.availability_zone ? obj.availability_zone : '';
    config.btn.disabled = false;
    config.btn.type = null;
    config.btn.value = 'modify';
  } else {
    config.fields[0].value = '';
    config.fields[1].value = '';
    config.btn.disabled = true;
    config.btn.type = 'create';
    config.btn.value = 'add';
  }
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let hosts = [];
      if(!obj) {
        request.getServicesList().then((res) => {
          res.forEach((r) => {
            hosts.push({
              id: r.id,
              name: r.host
            });
          });
          if (hosts.length > 0) {
            refs.available_hosts.setState({
              data: hosts,
              hide: false
            });
          }
        });
      }
    },
    onConfirm: function(refs, cb) {
      let data = {
        aggregate: {
          name: refs.name.state.value
        }
      };
      if(refs['availability-zones'].state.value) {
        data.aggregate.availability_zone = refs['availability-zones'].state.value;
      }
      if(!obj) {
        let list = {
          addList: []
        };
        refs.available_hosts.state.data.forEach(function(ele) {
          if (ele.selected) {
            list.addList.push(ele.name);
          }
        });
        request.createAggregate(data, list).then((res) => {
          callback && callback();
          cb(true);
        }).catch((err) => {
          cb(false, getErrorMessage(err));
        });
      } else {
        request.updateAggregate(obj.id, data).then((res) => {
          callback && callback();
          cb(true);
        }).catch((err) => {
          cb(false, getErrorMessage(err));
        });
      }
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'name':
          refs.btn.setState({
            disabled: !refs.name.state.value
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
