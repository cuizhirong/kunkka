var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  var props = {
    __: __,
    parent: parent,
    config: config,

    onInitialize: function(refs) {
      obj.attachments.forEach(ele => {
        request.getServerById(ele.server_id).then((res) => {
          var server = res.server,
            data = [];

          data.push({
            id: ele.server_id,
            attachmentId: ele.id,
            name: server ? server.name : '(' + ele.server_id.substr(0, 8) + ')'
          });

          refs.instance.setState({
            data: data
          });
        }).catch(e => {
          if(e.status === 404) {
            var data = [];

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
      var selected = refs.instance.state.data.filter((ele) => ele.selected)[0];

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
