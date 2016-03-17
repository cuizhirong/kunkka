var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var createInstance = require('client/dashboard/modules/instance/pop/create_instance/index');

function pop(obj, callback, parent) {

  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  var props = {
    parent: parent,
    config: config,

    onInitialize: function(refs) {
      request.getInstanceList().then((data) => {
        if (data.instance.length > 0) {
          refs.instance.setState({
            data: data.instance,
            value: data.instance[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var serverId = refs.instance.state.value,
        portId = obj.id;
      request.attachInstance(serverId, portId).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'instance':
          if(refs.instance.state.clicked) {
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
