var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.rawItem.name;

  var volumeData = {};
  var typeData = [];
  obj.types.forEach((type) => {
    volumeData[type] = [];
    typeData.push(type);
  });
  config.fields[1].data = typeData;
  config.fields[1].value = typeData[0];

  obj.volumes.forEach((ele) => {
    if (ele.status === 'available') {
      var hasVolume = obj.rawItem.volume.some((v) => {
        if (v.id === ele.id) {
          return true;
        }
        return false;
      });

      if (!hasVolume) {
        volumeData[ele.volume_type].push(ele);
      }
    }
  });

  config.fields[2].data = volumeData[config.fields[1].value];

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.attachVolume(obj.rawItem, refs.volume.state.value).then(() => {
        callback && callback();
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'volume':
          refs.btn.setState({
            disabled: !state.value
          });
          break;
        case 'type':
          refs.volume.setState({
            data: volumeData[state.value]
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
