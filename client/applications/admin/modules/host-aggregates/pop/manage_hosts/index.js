const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, parent, callback) {
  let hosts = [];
  config.fields[0].text = obj.name;
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getServicesList().then((res) => {
        res.forEach((r) => {
          let s = obj.hosts.find(h => h === r.host);
          let d = {
            name: r.host,
            id: r.host,
            selected: s ? !!s : false
          };
          hosts.push(d);
        });
        if (hosts.length > 0) {
          refs.available_hosts.setState({
            data: hosts,
            hide: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      let list = {};
      let addList = [];
      let removeList = [];
      refs.available_hosts.state.data.forEach(function(ele, i) {
        if(ele.selected && !hosts[i].selected) {
          addList.push(ele.name);
        }
        if(!ele.selected && hosts[i].selected) {
          removeList.push(ele.name);
        }
      });
      list.addList = addList;
      list.removeList = removeList;
      request.manageHosts(obj.id, list).then((res) => {
        callback && callback();
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
