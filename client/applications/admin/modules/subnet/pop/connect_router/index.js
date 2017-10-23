const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('../../../../utils/error_message');
const __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getRouters(obj.project_id).then((sameProject) => {
        if (sameProject.length > 0) {
          refs.router.setState({
            data: sameProject,
            value: sameProject[0].id,
            hide: false
          });
          refs.btn.setState({
            disabled: false
          });
        } else {
          refs.router.setState({
            hide: false
          });
          refs.btn.setState({
            disabled: true
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.connectRouter(refs.router.state.value, {
        subnet_id: obj.id
      }).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        refs.error.setState({
          value: getErrorMessage(err),
          hide: false
        });
      });
    },
    onAction: function(field, status, refs) {
      switch (field) {
        case 'router':
          refs.error.setState({
            hide: true
          });
          refs.btn.setState({
            disabled: false
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
