var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {

  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  var props = {
    __: __,
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
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
