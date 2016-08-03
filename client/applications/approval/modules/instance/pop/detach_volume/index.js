var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, btnType, parent, callback) {
  config.fields[0].text = obj.rawItem.name;

  //convey data array to config in cases of detial page remove and main table remove
  if(btnType) {
    var volume = obj.childItem,
      detailData = [];
    detailData.push({
      name: volume.name ? volume.name + ' ( ' + volume.volume_type + ' | ' + volume.size + 'GB )' :
        '(' + volume.id.slice(0, 8) + ')' + ' ( ' + volume.volume_type + ' | ' + volume.size + 'GB )',
      id: volume.id,
      selected: true
    });
    config.fields[1].data = detailData;
    config.btn.disabled = false;
  } else {
    var volumes = obj.rawItem.volume,
      mainData = [];
    volumes.forEach(v => {
      mainData.push({
        name: v.name ? v.name + ' ( ' + v.volume_type + ' | ' + v.size + 'GB )' :
          '(' + v.id.slice(0, 8) + ')' + ' ( ' + v.volume_type + ' | ' + v.size + 'GB )',
        id: v.id,
        selected: false
      });
    });

    config.btn.disabled = true;
    if(volumes.length === 1) {
      mainData[0].selected = true;
      config.btn.disabled = false;
    }
    config.fields[1].data = mainData;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      if(btnType) {
        request.detachVolume(obj).then((res) => {
          callback && callback(res);
          cb(true);
        });
      } else {
        var dataArray = [];
        refs.volume.state.data.some((v) => {
          if(v.selected) {
            dataArray.push(v);
          }
        });
        request.detachSomeVolume(obj.rawItem.id, dataArray).then((res) => {
          callback && callback(res);
          cb(true);
        });
      }
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'volume':
          refs.btn.setState({
            disabled: !state.value
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
