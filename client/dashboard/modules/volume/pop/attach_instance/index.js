var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances((instances) => {
        var data = [];

        instances.forEach((ele) => {
          data.push({
            id: ele.id,
            name: ele.name + ' (' + ele.id.substr(0, 8) + ')'
          });
        });

        refs.instance.setState({
          data: data
        });
      });
    },
    onConfirm: function(refs, cb) {
      var selected = refs.instance.state.data.filter((ele) => ele.selected)[0];

      request.attachInstance({
        serverId: selected.id,
        volumeId: obj.id
      }).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs){
    }
  };

  commonModal(props);
}

module.exports = pop;
