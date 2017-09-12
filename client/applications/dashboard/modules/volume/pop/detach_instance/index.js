const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let data = [];
      obj.attachments.forEach((ele) => {
        if (obj.server.status === 'SOFT_DELETED') {
          data.push({
            id: ele.server_id,
            attachmentId: ele.volume_id,
            name: '(' + ele.server_id.substr(0, 8) + ')'
          });
        } else {
          data.push({
            id: ele.server.id,
            attachmentId: ele.id,
            name: ele.server.name
          });
        }
      });

      refs.instance.setState({
        data: data
      });
      if(data.length === 1) {
        refs.instance.setState({
          value: data[0].id
        });
        data[0].selected = true;
      }
    },
    onConfirm: function(refs, cb) {
      let selected = refs.instance.state.data.filter((ele) => ele.selected)[0];

      request.detachInstance({
        attachmentId: selected.attachmentId,
        serverId: selected.id
      }).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs){
      switch (field) {
        case 'instance':
          refs.btn.setState({
            disabled: !status.value
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
