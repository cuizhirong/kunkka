const commonModal = require('client/components/modal_common/index');
const createQos = require('../../../qos-spec/pop/create/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getQosSpecs().then((res) => {
        if (res.qos_specs.length > 0) {
          refs.spec.setState({
            data: res.qos_specs,
            value: res.qos_specs[0].id,
            hide: false
          });
          refs.btn.setState({
            disabled: false
          });
        } else {
          refs.btn.setState({
            disabled: true
          });
          refs.spec.setState({
            hide: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      request.connectQos(refs.spec.state.value, obj.id).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'spec':
          refs.btn.setState({
            disabled: false
          });
          if(refs.spec.state.clicked) {
            createQos(null, null, (res)=> {
              refs.spec.setState({
                data: [res.qos_specs],
                value: res.qos_specs.id,
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
