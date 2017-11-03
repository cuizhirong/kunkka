let commonModal = require('client/components/modal_common/index');
let config = require('./config.json');
let request = require('../../request');
let __ = require('locale/client/dashboard.lang.json');
let getErrorMessage = require('client/applications/dashboard/utils/error_message');
let volTypes = require('./volume_type');

const ENABLE_CHARGE = HALO.settings.enable_charge;
const DEFAULT_PRICE = '0.0000';
const UNITNUMBER = 1024 * 1024 * 1024;

let allCapacity;

let copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function getCapacitySize(refs, state, type) {
  let item = state.data.filter(_data => _data.id === state.value);
  let size, minValue;

  switch(type) {
    case 'image':
      size = item[0] && Math.ceil(item[0].size / UNITNUMBER);
      break;
    default:
      size = item[0] && item[0].size;
      break;
  }

  let value = minValue = size < 1 ? 1 : size;

  refs.capacity_size.setState({
    value: value,
    inputValue: value,
    min: minValue || 1
  });
}

function getCapacity(overview) {
  //capacity of all the types
  allCapacity = overview.overview_usage.gigabytes;

  //capacity set by user
  let settings = HALO.settings;
  let singleMax = settings.max_single_gigabytes ? settings.max_single_gigabytes : 1000;

  //capacity set by front-end side
  let defaultTotal = 1000;

  let typeCapacity = {};
  overview.volume_types.forEach((type) => {
    typeCapacity[type] = overview.overview_usage['gigabytes_' + type];

    let min = 1, max, total, used;

    //capacity of the type
    let capacity = overview.overview_usage['gigabytes_' + type];

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
  let copyConfig = copyObj(config);
  if (obj) {
    copyConfig.fields[1].hide = true;
    copyConfig.fields.unshift({
      type: 'icon_label',
      field: 'snapshot',
      icon_type: 'snapshot',
      text: obj.name
    });
  }

  let typeCapacity = {};
  let volumeTypes;

  let props = {
    __: __,
    parent: parent,
    config: copyConfig,
    onInitialize: function(refs) {
      refs.type.setState({
        renderer: volTypes
      });
      let volumeSource = [{
        id: 'no_source',
        name: __.no_source
      }, {
        id: 'image',
        name: __.image
      }, {
        id: 'volume',
        name: __.volume
      }];

      refs.volume_source.setState({
        data: volumeSource,
        value: volumeSource[0] && volumeSource[0].id
      });

      request.getSources().then(sources => {
        refs.image.setState({
          data: sources.image,
          value: sources.image[0] && sources.image[0].id
        });
        let volSou = sources.volume.filter(v => v.status === 'available' || v.status === 'in-use');
        refs.volume.setState({
          data: volSou,
          value: volSou[0] && volSou[0].id
        });
        request.getOverview().then((overview) => {

          typeCapacity = getCapacity(overview);

          volumeTypes = overview.volume_types;
          let volumeType = volumeTypes[0];

          if (volumeTypes.length !== 0) {
            let cap = typeCapacity[volumeType];
            let isError = cap.max < cap.min || cap.max <= 0;

            let setTypes = () => {
              if (obj) {
                volumeType = obj.volume.volume_type || null;
                refs.type.setState({
                  renderer: volTypes,
                  data: volumeType ? [volumeType] : [],
                  value: volumeType,
                  hide: false
                });
              } else {
                refs.type.setState({
                  renderer: volTypes,
                  data: volumeTypes,
                  value: volumeTypes.length > 0 ? volumeType : null,
                  hide: false
                });
              }
            };

            if (ENABLE_CHARGE) {
              if (!isError) {
                setTypes();
                refs.charge.setState({
                  value: Math.max.apply(null, HALO.prices.other['volume.volume']) * cap.min,
                  hide: false
                });
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
      });
    },
    onConfirm: function(refs, cb) {
      let data = {};
      data.name = refs.name.state.value;
      data.volume_type = obj ? obj.volume.volume_type : refs.type.refs.volume_type.state.value;
      data.size = Number(refs.capacity_size.state.value);
      if (obj) {
        data.snapshot_id = obj.id;
      }
      let volumeSource = refs.volume_source.state.value;
      switch (volumeSource) {
        case 'image':
          data.imageRef = refs.image.state.value;
          break;
        case 'volume':
          data.source_volid = refs.volume.state.value;
          break;
        default:
          break;
      }

      request.createVolume(data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      let volType = refs.type.state.value;

      switch (field) {
        case 'capacity_size': {
          let cap = refs.capacity_size.state;
          let isError = cap.max < cap.min || cap.max <= 0;
          let isInputError = state.error;
          let value = state.min >= state.max ? state.min : refs.capacity_size.state.value;
          let inputValue = state.min >= state.max ? state.min : refs.capacity_size.state.inputValue;
          let volume = refs.volume.state.data.filter(_data => _data.id === refs.volume.state.value);


          refs.capacity_size.setState({
            value: value,
            inputValue: inputValue || 1,
            disabled: isError
          });

          refs.btn.setState({
            disabled: refs.capacity_size.state.hide || isError || isInputError || (refs.volume_source.state.value === 'volume' && volume.length === 0)
          });

          refs.warning.setState({
            value: __.tip_volume_create_error,
            hide: !isError
          });

          if (ENABLE_CHARGE) {
            let sliderEvent = state.eventType === 'mouseup';
            let inputEvnet = state.eventType === 'change' && !state.error;

            if (!isError) {
              if (sliderEvent || inputEvnet) {
                refs.charge.setState({
                  value: Math.max.apply(null, HALO.prices.other['volume.volume']) * value
                });
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
          let cap = typeCapacity[volType],
            min, max, isError;
          let volume = refs.volume.state.data.filter(_data => _data.id === refs.volume.state.value)[0];
          if (cap) {
            min = obj ? obj.size : cap.min;
            max = cap.max;
            isError = cap.max < cap.min || cap.max <= 0;
          } else if (volume) {
            min = obj ? obj.size : volume.size;
            max = allCapacity.total - allCapacity.used;
            isError = max < min || max <= 0;
          }

          refs.type.state.data && refs.capacity_size.setState({
            min: min || 1,
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
              refs.charge.setState({
                value: Math.max.apply(null, HALO.prices.other['volume.volume']) * min
              });
            } else {
              refs.charge.setState({
                value: DEFAULT_PRICE
              });
            }
          }
          break;
        }
        case 'volume_source':
          switch (refs.volume_source.state.value) {
            case 'image':
              refs.type.refs.volume_type.refs.volumeTypes.setState({
                data: volumeTypes,
                value: volumeTypes[0]
              });
              refs.image.setState({
                hide: false
              });
              refs.volume.setState({
                hide: true
              });
              break;
            case 'volume':
              let volume = refs.volume.state.data.filter(_data => _data.id === refs.volume.state.value);
              let volumeType = volume[0] && volume[0].volume_type ? [volume[0].volume_type] : [];

              refs.type.refs.volume_type.refs.volumeTypes.setState({
                data: volumeType,
                value: volumeType[0]
              });
              refs.image.setState({
                hide: true
              });
              refs.volume.setState({
                hide: false
              });
              break;
            default:
              refs.type.refs.volume_type && refs.type.refs.volume_type.refs.volumeTypes.setState({
                data: volumeTypes,
                value: volumeTypes ? volumeTypes[0] : null
              });
              refs.image.setState({
                hide: true
              });
              refs.volume.setState({
                hide: true
              });
              refs.capacity_size.setState({
                value: 1,
                inputValue: 1,
                min: 1
              });
              break;
          }
          break;
        case 'image':
          if (refs.volume_source.state.value === 'image') {
            getCapacitySize(refs, state, 'image');
          }
          break;
        case 'volume':
          if (refs.volume_source.state.value === 'volume') {
            let volume = refs.volume.state.data.filter(_data => _data.id === refs.volume.state.value);
            let volumeType = volume[0] && volume[0].volume_type ? [volume[0].volume_type] : [];
            refs.type.refs.volume_type.refs.volumeTypes.setState({
              data: volumeType,
              value: volumeType[0]
            });
            getCapacitySize(refs, state, 'volume');
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
