var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  function getImageGroup(imageArray) {
    let imageGroup = [];
    imageArray.forEach(image => {
      imageGroup.push({
        id: image.id,
        name: image.name || '(' + image.id.substring(0, 8) + ')',
        data: [image]
      });
    });
    return imageGroup;
  }
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
      let data = {
        rebuild: {
          imageRef: refs.image.state.value
        }
      };
      request.rebuildInstance(obj.id, data).then(res => {
        cb(true);
        callback && callback();
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
