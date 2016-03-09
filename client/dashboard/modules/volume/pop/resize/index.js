var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  console.log(obj);
  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      setTimeout(function() {
        refs.performance_size.setState({
          max: 300
        });
      }, 100);
    },
    onConfirm: function(refs, cb) {
      callback();
      cb(true);
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'performance_size':
          if (state.value < 100) {
            refs.iops.setState({
              value: config.fields[3].min
            });
            refs.throughput.setState({
              value: config.fields[4].min
            });
          } else {
            refs.iops.setState({
              value: config.fields[3].min + Math.floor((state.value - 100) / 10) * 50
            });
            refs.throughput.setState({
              value: config.fields[4].min + Math.floor((state.value - 100) / 10)
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
