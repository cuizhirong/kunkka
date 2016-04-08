var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var createRouter = require('client/applications/dashboard/modules/router/pop/create_router/index');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getRouters().then((data) => {
        if (data.length > 0) {
          refs.router.setState({
            data: data,
            value: data[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.connectRouter(refs.router.state.value, {
        subnet_id: obj.id
      }).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'router':
          if (refs.router.state.clicked) {
            createRouter(refs.modal, (res) => {
              refs.router.setState({
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
