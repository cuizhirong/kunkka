const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const utils = require('../../../../utils/utils');
const __ = require('locale/client/dashboard.lang.json');

function pop(arr, parent, breadcrumb, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      let params = {
        Bucket: breadcrumb[0],
        type: 'folder',
        Name: utils.getURL(breadcrumb, refs.name.state.value)
      };
      request.createFolder(params).then(res => {
        callback && callback(res);
        cb(true);
      }).catch(err => {
        cb(false, JSON.parse(err.responseText).message || 'ERROR');
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'name':
          let tester = /\//;
          refs.btn.setState({
            disabled: tester.test(refs.name.state.value) || !refs.name.state.value
          });
          refs.name.setState({
            error: tester.test(refs.name.state.value) || !refs.name.state.value
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
