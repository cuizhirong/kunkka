var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var createInstance = require('client/dashboard/modules/instance/pop/create_instance/index');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances().then((data) => {
        if (data.length > 0) {
          refs.instance.setState({
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
      request.addInstance(refs.instance.state.value, obj.id, obj.network_id).then((res) => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'instance':
          if (refs.instance.state.clicked) {
            createInstance((res) => {
              refs.instance.setState({
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
