var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function pop(obj, parent, callback) {
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

  var typeCapacity = {};

  var props = {
    __: __,
    parent: parent,
    config: copyConfig,
    onInitialize: function(refs) {
      request.getOverview().then((overview) => {
        if (overview.volume_types) {
          refs.type.setState({
            data: overview.volume_types,
            value: overview.volume_types.length > 0 ? overview.volume_types[0] : null,
            hide: false
          });
        }

        //capacity of all the types
        var allCapacity = overview.overview_usage.gigabytes;

        //capacity set by user
        var settings = HALO.settings;
        var singleMax = settings.max_single_gigabytes ? settings.max_single_gigabytes : 1000;

        //capacity set by front-end side
        var defaultTotal = 1000;

        overview.volume_types.forEach((type) => {
          typeCapacity[type] = overview.overview_usage['gigabytes_' + type];

          var min = 1, max, total, used;

          //capacity of the type
          var capacity = overview.overview_usage['gigabytes_' + type];

          if (capacity.total < 0) {
            if (allCapacity.total < 0) {
              if (settings.total_gigabytes) {
                total = settings.total_gigabytes;
              } else {
                total = defaultTotal;
              }
            } else {
              total = allCapacity.total;
            }
            used = allCapacity.used;
          } else {
            total = capacity.total;
            used = capacity.used;
          }

          max = total - used;
          if (max > singleMax) {
            max = singleMax;
          }
          if (max <= 0) {
            max = 0;
            min = 0;
          }

          typeCapacity[type].max = max;
          typeCapacity[type].min = min;
        });

        var selected = typeCapacity[overview.volume_types[0]];
        var selectedMax = selected.max;
        var selectedMin = selected.min;

        refs.capacity_size.setState({
          min: selectedMin,
          max: selectedMax,
          value: selectedMin,
          inputValue: selectedMin,
          disabled: selectedMax === 0 ? true : false,
          hide: false
        });

        refs.charge.setState({
          hide: false
        });

        refs.btn.setState({
          disabled: false
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
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        var reg = new RegExp('"message":"(.*)","');
        var tip = reg.exec(err.response)[1];

        refs.error.setState({
          value: tip,
          hide: false
        });
        cb(false);
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'type':
          var type = refs.type.state.value;
          var capacity = typeCapacity[type];

          if (capacity) {
            var min = capacity.min;
            var max = capacity.max;
            var value = parseFloat(refs.capacity_size.state.inputValue);

            if (isNaN(value) || value < min) {
              value = min;
            } else if (value > max) {
              value = max;
            }

            refs.capacity_size.setState({
              min: min,
              max: max,
              value: value,
              inputValue: value,
              hide: false,
              disabled: max === 0 ? true : false,
              error: false
            });
            refs.btn.setState({
              disabled: false
            });
          }
          break;
        case 'capacity_size':
          refs.btn.setState({
            disabled: state.error
          });
          refs.charge.setState({
            value: state.value
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
