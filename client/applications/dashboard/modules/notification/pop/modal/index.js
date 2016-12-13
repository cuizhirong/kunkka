var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var addEndpoint = require('./add_endpoint');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  if (obj && obj.constructor === Array) {
    config.title = ['add_', 'endpoint'];
    config.fields[0].required = 'false';
    config.fields[0].type = 'icon_label';
    config.fields[0].text = obj[0].name;
    config.fields[0].icon_type = 'notification';
    config.fields[1].hide = true;
    config.fields[2].hide = true;
    config.btn.value = 'add_';
    config.btn.disabled = false;
  } else if (obj && obj.constructor === Object) {
    config.title = ['update', 'notification'];
    config.fields[0].type = 'input';
    config.fields[0].value = obj.name;
    config.fields[1].value = obj.description;
    config.fields[1].hide = false;
    config.fields[2].hide = false;
    config.btn.value = 'update';
    config.btn.type = 'update';
    config.btn.disabled = false;
  } else {
    config.title = ['create', 'notification'];
    config.fields[0].type = 'input';
    config.fields[0].value = '';
    config.fields[1].value = '';
    config.fields[1].hide = false;
    config.fields[2].hide = false;
    config.btn.value = 'create';
    config.btn.type = 'create';
    config.btn.disabled = true;
  }
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.endpoint.setState({
        renderer: addEndpoint,
        value: 'Email',
        msg: obj && obj.constructor === Object ? obj.subs : [],
        subs: [],
        data: [{
          id: 1,
          name: 'Email'
        }, {
          id: 2,
          name: 'SMS'
        }],
        phoneValue: '86',
        uuid: obj && obj.constructor === Object ? obj.uuid : ''
      });
    },
    onConfirm: function(refs, cb) {
      var data = {
        name: obj && obj.constructor === Array ? obj[0].name : refs.name.state.value
      };
      var uuid = '';
      if (!obj || obj.constructor === Object) {
        data.description = refs.description.state.value;
      }
      if (refs.add_endpoint.state.checked) {
        data.sub_ids = [];
        refs.endpoint.state.msg.forEach(sub => {
          data.sub_ids.push(sub.uuid);
        });
        if (obj && obj.constructor === Array) {
          obj[0].subs.forEach(sub => {
            data.sub_ids.push(sub.uuid);
          });
        }
      }
      if (obj) {
        uuid = obj.constructor === Array ? obj[0].uuid : obj.uuid;
        request.updateNotify(data, uuid).then(res => {
          callback && callback(res);
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error));
        });
      } else {
        request.addNotify(data).then(res => {
          callback && callback(res);
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, state, refs) {
      var endpointChecked = refs.add_endpoint.state.checked;
      switch (field) {
        case 'add_endpoint':
          refs.endpoint.setState({
            hide: !endpointChecked
          });
          /*if (refs.name.state.value !== '') {
            refs.btn.setState({
              disabled: !endpointChecked
            });
          } else {
            refs.btn.setState({
              disabled: false
            });
          }*/
          break;
        case 'name':
          if (!endpointChecked) {
            if (refs.name.state.value !== '') {
              refs.btn.setState({
                disabled: false
              });
            } else {
              refs.btn.setState({
                disabled: true
              });
            }
          } else {
            if (refs.name.state.value !== '') {
              refs.btn.setState({
                disabled: false
              });
            } else {
              refs.btn.setState({
                disabled: true
              });
            }
          }
          break;
        case 'endpoint':
          if (state.subs && state.subs.length !== 0) {
            if (refs.name.state.value !== '') {
              refs.btn.setState({
                disabled: false
              });
            }
          } else {
            refs.btn.setState({
              disabled: true
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
