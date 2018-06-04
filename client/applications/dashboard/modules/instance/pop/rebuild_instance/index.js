const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');

const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

function getOriginalIndex(imageId, images) {
  let index = images.findIndex((image) => {
    return image.id === imageId;
  });

  index = index !== -1 ? index : 0;
  return index;
}

function pop(obj, parent, callback) {
  function getImageGroup(imageArray) {
    let imageGroup = [];
    imageArray.forEach(image => {
      if(image.status !== 'deactivated') {
        imageGroup.push({
          id: image.id,
          name: image.name || '(' + image.id.substring(0, 8) + ')',
          data: [image]
        });
      }
    });
    return imageGroup;
  }
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getImages().then(data => {
        if (data.length > 0) {
          let imageGroup = getImageGroup(data);

          if (imageGroup.length > 0) {
            let originalImageId = obj.image && obj.image.id;
            // 默认选择原始的镜像，否则就是列表第一个镜像
            let originalImageIndex = getOriginalIndex(originalImageId, imageGroup);

            refs.image.setState({
              data: imageGroup,
              value: imageGroup[originalImageIndex].data[0].id
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
