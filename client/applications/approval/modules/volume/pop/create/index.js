var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');
var utils = require('client/applications/approval/utils/utils');

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
  var volumeTypes = [];

  var typeCapacity = {};

  var props = {
    __: __,
    parent: parent,
    config: copyConfig,
    onInitialize: function(refs) {
      request.getOverview().then((overview) => {
        if (overview.volume_types.length > 0) {
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

            refs.warning.setState({
              value: __.tip_volume_create_error,
              hide: !(max <= 0)
            });

            typeCapacity[type].max = max;
            typeCapacity[type].min = min;
          });

          var selected = typeCapacity[overview.volume_types[0]];
          var selectedMax = selected.max;
          var selectedMin = selected.min;

          var setFields = () => {
            var overviewVolumeTypes = overview.volume_types;
            var settingsVolumeTypes = HALO.settings.appliable_volume_types ? JSON.parse(HALO.settings.appliable_volume_types) : [];
            overviewVolumeTypes.forEach((item) => {
              if(settingsVolumeTypes.includes(item)) {
                volumeTypes.push(item);
              }
            });
            if (volumeTypes && volumeTypes.length > 0) {
              refs.type.setState({
                data: volumeTypes,
                value: volumeTypes.length > 0 ? volumeTypes[0] : null,
                hide: false
              });
            } else {
              refs.type.setState({
                hide: false
              });
            }

            if (obj) {
              selectedMin = obj.size;
            }
            var lackOfSize = selectedMin > selectedMax;

            refs.capacity_size.setState({
              min: selectedMin,
              max: selectedMax,
              value: selectedMin,
              inputValue: selectedMin,
              disabled: lackOfSize || selectedMax <= 0,
              hide: false
            });

            refs.btn.setState({
              disabled: lackOfSize || selectedMax <= 0
            });
            if(!volumeTypes || volumeTypes.length < 1) {
              refs.btn.setState({
                disabled: true
              });
            }
          };
          setFields();
        } else {
          refs.no_tip.setState({
            value: __.no_avail_type,
            hide: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var usage = refs.usage.state.value;
      var data = {};
      data.detail = {};
      var createDetail = data.detail;
      createDetail.create = [];
      var configCreate = createDetail.create;
      var createItem = {};
      createItem = {
        _type: 'Volume',
        _identity: 'volume',
        name: refs.name.state.value,
        volume_type: obj ? obj.volume_type : refs.type.state.value,
        size: Number(refs.capacity_size.state.value),
        metadata: {
          owner: HALO.user.username,
          usage: usage
        }
      };
      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;
      request.createApplication(data).then((res) => {
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
              disabled: max === 0,
              error: false
            });

            refs.warning.setState({
              hide: !(max <= 0)
            });

            refs.btn.setState({
              disabled: max <= 0
            });

          }
          break;
        case 'capacity_size':
          if(volumeTypes.length > 0) {
            refs.btn.setState({
              disabled: state.error
            });
          }
          break;
        case 'usage':
          var usage = refs.usage.state.value;
          var usageUTF8Length = utils.getStringUTF8Length(usage);
          if (usageUTF8Length > 255 || usageUTF8Length === 0) {
            refs.btn.setState({
              disabled: true
            });
            refs.usage.setState({
              error: true
            });
          } else {
            refs.btn.setState({
              disabled: false
            });
            refs.usage.setState({
              error: false
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
