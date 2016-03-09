var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');

function pop(obj, callback, parent) {
  if (typeof obj === 'object') {
    config.fields[0].text = obj.name;
    config.fields[0].hide = false;
  }
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
        case 'type':
          var b = false;
          if (state.value === 'performance') {
            b = true;
          }
          refs.performance_size.setState({
            hide: !b
          });
          refs.iops.setState({
            hide: !b
          });
          refs.throughput.setState({
            hide: !b
          });
          refs.capacity_size.setState({
            hide: b
          });
          refs.capacity_tip.setState({
            hide: b
          });
          break;
        case 'performance_size':
          if (state.value < 100) {
            refs.iops.setState({
              value: config.fields[4].min
            });
            refs.throughput.setState({
              value: config.fields[5].min
            });
          } else {
            refs.iops.setState({
              value: config.fields[4].min + Math.floor((state.value - 100) / 10) * 50
            });
            refs.throughput.setState({
              value: config.fields[5].min + Math.floor((state.value - 100) / 10)
            });
          }
          break;
        case 'shared_volume':
          console.log(state);
          refs.shared_tip.setState({
            hide: !state.checked
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
