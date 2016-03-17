var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var createRouter = require('client/dashboard/modules/router/pop/create_router/index');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getRouters((data) => {
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
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'router':
          if (refs.router.state.clicked) {
            createRouter((res) => {
              refs.router.setState({
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
