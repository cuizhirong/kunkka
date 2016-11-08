var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
// var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var __ = require('locale/client/dashboard.lang.json');
var unitConverter = require('client/utils/unit_converter');

function pop(obj, parent, callback) {
  config.fields[0].icon_type = 'image';
  config.fields[0].text = obj.name;

  var typeCapacity = {};
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.name.setState({
        value: obj.name
      });

      //get volume types
      request.getOverview().then((overview) => {

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
          if (overview.volume_types) {
            refs.type.setState({
              data: overview.volume_types,
              value: overview.volume_types.length > 0 ? overview.volume_types[0] : null,
              hide: false
            });
          }

          var minBound = unitConverter(obj.size);
          if(minBound.unit === 'GB') {
            selectedMin = minBound.num;
          } else {
            selectedMin = 1;
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
        };

        if (HALO.settings.enable_charge) {
          request.getVolumePrice('volume.size', selectedMin).then((res) => {
            setFields();
            refs.charge.setState({
              value: res.unit_price,
              hide: false
            });
          }).catch((error) => {
            setFields();
            refs.charge.setState({
              value: '0.0000',
              hide: false
            });
          });
        } else {
          setFields();
        }
      });
    },
    onConfirm: function(refs, cb) {
      var data = {};
      data.name = refs.name.state.value;
      data.volume_type = (obj && obj.volume_type) ? obj.volume_type : refs.type.state.value;
      data.size = Number(refs.capacity_size.state.value);
      data.imageRef = obj.id;

      request.createVolume(data).then(res => {
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

            if (HALO.settings.enable_charge) {
              request.getVolumePrice(type + '.volume.size', value).then((res) => {
                refs.charge.setState({
                  value: res.unit_price
                });
              }).catch((error) => {});
            }
          }
          break;
        case 'capacity_size':
          if (HALO.settings.enable_charge) {
            var sliderEvent = state.eventType === 'mouseup';
            var inputEvnet = state.eventType === 'change' && !state.error;
            var volType = refs.type.state.value;

            if (sliderEvent || inputEvnet) {
              request.getVolumePrice(volType + '.volume.size', state.value).then((res) => {
                refs.charge.setState({
                  value: res.unit_price
                });
              }).catch((error) => {});
            }
          }

          refs.btn.setState({
            disabled: state.error
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
