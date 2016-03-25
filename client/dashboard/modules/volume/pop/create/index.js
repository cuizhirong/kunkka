var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function pop(obj, callback, parent) {
  var copyConfig = copyObj(config);
  if (obj) {
    copyConfig.fields[1].hide = true;
    copyConfig.fields.unshift({
      type: 'icon_label',
      field: 'snapshot',
      icon_type: 'snapshot',
      text: obj.name
    });
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
      config: copyConfig,
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
        data.volume_type = obj ? obj.volume_type : refs.type.state.value;
        data.size = Number(refs.capacity_size.state.value);
        if (obj) {
          data.snapshot_id = obj.id;
        }

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

            var min = obj ? obj.size : 1;
            refs.capacity_size.setState({
              min: min,
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
