const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    parent: parent,
    config: config,

    onInitialize: function(refs) {
      obj.attachments.forEach(ele => {
        request.getServerById(ele.server_id).then((res) => {
          let server = res.server,
            data = [];

          data.push({
            id: ele.server_id,
            attachmentId: ele.id,
            name: server ? server.name : '(' + ele.server_id.substr(0, 8) + ')'
          });

          refs.instance.setState({
            data: data
          });

          if(data.length === 1) {
            data[0].selected = true;
            refs.instance.setState({
              value: data[0].id
            });
          }
        }).catch(e => {
          if(e.status === 404) {
            let data = [];

            data.push({
              name: __.instance + ' (' + ele.server_id.substr(0, 8) + ') ' + __.already_deleted
            });

            refs.instance.setState({
              data: data
            });
          }
        });
      });
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
