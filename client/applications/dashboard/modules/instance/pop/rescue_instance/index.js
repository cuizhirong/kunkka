const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

function isIncorrectPwd(pwd) {
  return (pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd));
}

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

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getImages().then(data => {
        if (data.length > 0) {
          let imageGroup = getImageGroup(data);

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

      request.rescueInstance(obj.id, data).then(res => {
        cb(true);
        callback && callback(res);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'password':
          let isError = isIncorrectPwd(state.value);
          refs.btn.setState({
            disabled: isError
          });
          refs.password.setState({
            error: isError
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
