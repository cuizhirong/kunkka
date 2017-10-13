const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const uploadFile = require('./upload_file');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  let props = {
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
        let url = '/proxy-swift/' + HALO.user.projectId + '_template' + '/' + fileName;
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
