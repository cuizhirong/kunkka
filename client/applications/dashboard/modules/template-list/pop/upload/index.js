var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var uploadFile = require('./upload_file');
var __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.upload.setState({
        renderer: uploadFile
      });
    },
    onConfirm: function(refs, cb) {
      let name = refs.name.state.value;
      let file = refs.upload.refs.upload.state.value;
      let fileName = name ? name : file.name;
      let reader = new FileReader();
      reader.onloadend = function () {
        let url = '/proxy-swift/v1/AUTH_' + HALO.configs.adminProjectId + '/' + HALO.user.projectId + '_template' + '/' + fileName;
        let xhr = new XMLHttpRequest();

        xhr.open('PUT', url, true);
        xhr.onreadystatechange = function () {
          cb(true);
          callback && callback();
        };
        xhr.send(reader.result);
      };
      reader.readAsArrayBuffer(file);
    },
    onAction: function(field, state, refs) {
      let file = refs.upload.refs.upload.state.value;
      switch (field) {
        case 'upload':
          refs.btn.setState({
            disabled: !file
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
