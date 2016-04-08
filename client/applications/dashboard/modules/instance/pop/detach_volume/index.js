var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, btnType, parent, callback) {
  config.fields[0].text = obj.rawItem.name;
  config.fields[1].data = btnType ? [obj.childItem] : obj.rawItem.volume;

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
        refs.volume.state.data.some((volume) => {
          if(volume.selected) {
            dataArray.push(volume);
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
