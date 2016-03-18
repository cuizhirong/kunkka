var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

function pop(obj, callback, parent) {
  if (typeof obj === 'object') {
    config.fields[0].text = '';
    config.fields[0].hide = false;
  }

  request.getOverview().then((overview) => {
    var typeCapacity = {};
    overview.volume_types.forEach((type) => {
      typeCapacity[type] = overview.overview_usage['gigabytes_' + type];
      if (typeCapacity[type].total < 0) {
        typeCapacity[type].total = overview.overview_usage.gigabytes.total;
      }
    });

    var props = {
      parent: parent,
      config: config,
      onInitialize: function(refs) {
        request.getVolumeTypes().then((res) => {
          var types = [];
          res.volume_types.forEach((type) => {
            types.push(type.name);
          });

          refs.type.setState({
            data: types,
            value: types[0] ? types[0] : null
          });
        });
      },
      onConfirm: function(refs, cb) {
        var data = {};
        data.name = refs.name.state.value;
        data.volume_type = refs.type.state.value;
        data.size = Number(refs.capacity_size.state.value);

        request.createVolume(data).then((res) => {
          callback(res);
          cb(true);
        });
      },
      onAction: function(field, state, refs) {
        switch(field) {
          case 'type':
            var type = refs.type.state.value;
            var capacity = typeCapacity[type];

            refs.capacity_size.setState({
              min: 1,
              max: capacity.total - capacity.used
            });
            break;
          default:
            break;
        }
      }
    };

    commonModal(props);

  });
}

module.exports = pop;
