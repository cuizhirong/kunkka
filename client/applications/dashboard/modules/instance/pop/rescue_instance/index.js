var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  function getImageGroup(imageArray) {
    let imageGroup = [];
    if (!obj.image) {
      imageArray.forEach(image => {
        imageGroup.push({
          id: image.id,
          name: image.name || '(' + image.id.substring(0, 8) + ')',
          data: [image]
        });
      });
    } else {
      imageGroup.push({
        id: obj.image.id,
        name: obj.image.name || '(' + obj.image.id.substring(0, 8) + ')',
        data: [obj.image]
      });
      imageArray.forEach(image => {
        if (image.id !== obj.image.id) {
          imageGroup.push({
            id: image.id,
            name: image.name || '(' + image.id.substring(0, 8) + ')',
            data: [image]
          });
        }
      });
    }
    return imageGroup;
  }
  config.fields[0].text = obj.name;
  config.fields[2].text = __.confirm_inst_action.replace('{0}', __.ins_action_reboot);

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getImages().then(data => {
        if (data.length > 0) {
          var imageGroup = getImageGroup(data);

          if (imageGroup.length > 0) {
            refs.image.setState({
              data: imageGroup,
              value: imageGroup[0].data[0].id
            });

            refs.btn.setState({
              disabled: false
            });
          }
        }
      });
    },
    onConfirm: function(refs, cb) {
      let data;
      if (refs.password.state.value) {
        data = {
          rescue: {
            adminPass: refs.password.state.value,
            rescue_image_ref: refs.image.state.value
          }
        };
      } else {
        data = {
          rescue: {
            rescue_image_ref: refs.image.state.value
          }
        };
      }
      console.log(data);
      request.rescueInstance(obj.id, data).then(res => {
        cb(true);
        callback && callback(res);
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
