var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

const ENABLE_CHARGE = HALO.settings.enable_charge;
const DEFAULT_PRICE = '0.0000';

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function getCapacity(overview) {
  //capacity of all the types
  var allCapacity = overview.overview_usage.gigabytes;

  //capacity set by user
  var settings = HALO.settings;
  var singleMax = settings.max_single_gigabytes ? settings.max_single_gigabytes : 1000;

  //capacity set by front-end side
  var defaultTotal = 1000;

  var typeCapacity = {};
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

  return typeCapacity;
}

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

        typeCapacity = getCapacity(overview);

        let volumeTypes = overview.volume_types;
        let volumeType = volumeTypes[0];

        if (volumeTypes.length !== 0) {
          let cap = typeCapacity[volumeType];
          let isError = cap.max < cap.min || cap.max <= 0;

          let setTypes = () => {
            if (obj) {
              volumeType = obj.volume.volume_type;
              refs.type.setState({
                data: [volumeType],
                value: volumeType,
                hide: false
              });
            } else {
              refs.type.setState({
                data: volumeTypes,
                value: volumeTypes.length > 0 ? volumeType : null,
                hide: false
              });
            }
          };

          if (ENABLE_CHARGE) {
            if (!isError) {
              request.getVolumePrice(volumeType + '.volume.size', cap.min).then((res) => {
                setTypes();
                refs.charge.setState({
                  value: res.unit_price,
                  hide: false
                });
              }).catch((error) => {});
            } else {
              setTypes();
              refs.charge.setState({
                value: DEFAULT_PRICE,
                hide: false
              });
            }
          } else {
            setTypes();
          }
        } else {
          refs.warning.setState({
            value: __.no_avail_type,
            hide: false
          });
        }

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
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      var volType = refs.type.state.value;

      switch (field) {
        case 'capacity_size': {
          let cap = refs.capacity_size.state;
          let isError = cap.max < cap.min || cap.max <= 0;
          let isInputError = state.error;
          let value = state.min >= state.max ? state.min : refs.capacity_size.state.value;
          let inputValue = state.min >= state.max ? state.min : refs.capacity_size.state.inputValue;

          refs.capacity_size.setState({
            value: value,
            inputValue: inputValue,
            disabled: isError
          });

          refs.btn.setState({
            disabled: isError || isInputError
          });

          refs.warning.setState({
            value: __.tip_volume_create_error,
            hide: !isError
          });

          if (ENABLE_CHARGE) {
            var sliderEvent = state.eventType === 'mouseup';
            var inputEvnet = state.eventType === 'change' && !state.error;

            if (!isError) {
              if (sliderEvent || inputEvnet) {
                request.getVolumePrice(volType + '.volume.size', value).then((res) => {
                  refs.charge.setState({
                    value: res.unit_price
                  });
                }).catch((error) => {});
              }
            } else {
              refs.charge.setState({
                value: DEFAULT_PRICE
              });
            }
          }
          break;
        }
        case 'type': {
          //set slider data
          let cap = typeCapacity[volType];
          let min = obj ? obj.size : cap.min;
          let max = cap.max;
          let isError = cap.max < cap.min || cap.max <= 0;

          refs.capacity_size.setState({
            min: min,
            max: max,
            value: min,
            inputValue: min,
            disabled: false,
            error: false,
            hide: false
          });

          //set charge
          if (ENABLE_CHARGE) {
            if (!isError) {
              request.getVolumePrice(volType + '.volume.size', min).then((res) => {
                refs.charge.setState({
                  value: res.unit_price
                });
              }).catch((error) => {});
            } else {
              refs.charge.setState({
                value: DEFAULT_PRICE
              });
            }
          }
          break;
        }
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
