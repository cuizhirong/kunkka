const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('../../../../utils/error_message');
const createRouter = require('client/applications/dashboard/modules/router/pop/create_router/index');
const __ = require('locale/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getRouters().then((data) => {
        if (data.length > 0) {
          refs.router.setState({
            data: data,
            value: data[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.connectRouter(refs.router.state.value, {
        subnet_id: obj.id
      }).then((res) => {
        if (HALO.settings.enable_floatingip_bandwidth) {
          request.changeBandwidth(refs.router.state.value, {
            gwratelimit: {}
          }).then(() => {
            callback && callback(res);
            cb(true);
          }).catch((error) => {
            cb(false, getErrorMessage(error));
          });
        } else {
          callback && callback(res);
          cb(true);
        }
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
          if (refs.router.state.clicked) {
            createRouter(refs.modal, (res) => {
              refs.router.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
              });
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
