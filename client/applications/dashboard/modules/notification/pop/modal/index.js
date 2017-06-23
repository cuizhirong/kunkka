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
    config.fields[0].required = 'false';
    config.fields[0].type = 'icon_label';
    config.fields[0].text = obj.name;
    config.fields[0].icon_type = 'notification';
    config.fields[1].value = obj.description;
    config.fields[1].hide = false;
    config.fields[2].hide = true;
    config.btn.value = 'update';
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
        subs: obj && obj.constructor === Object ? obj.subscriptions : [],
        data: [{
          id: 1,
          name: 'Email'
        }],
        phoneValue: '86',
        renderValue: '',
        name: obj && obj.constructor === Object ? obj.name : null
      });
    },
    onConfirm: function(refs, cb) {
      let ttl = Math.pow(2, 36);
      let data = {
        ttl: ttl
      };
      if (refs.add_endpoint.state.checked) {
        data.subcribers = refs.endpoint.refs.endpoints.state.opsubs;
      }
      if (obj && obj.constructor === Array) {
        request.addSubscriptions(obj[0].name, data).then(res => {
          callback && callback(res);
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error));
        });
      } else if(obj && obj.constructor === Object) {
        data.description = refs.description.state.value;
        data.name = obj.name;
        request.updateQueueWidthSubscriptions(data).then(res => {
          callback && callback(res);
          cb(true);
        }).catch(error => {
          cb(false, getErrorMessage(error));
        });
      } else {
        data.name = refs.name.state.value;
        data.description = refs.description.state.value;
        request.addQueueWidthSubscriptions(data).then(res => {
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
          break;
        case 'name':
          if (refs.add_endpoint.state.checked) {
            if(refs.endpoint.refs.endpoints.state.showsubs.length > 0) {
              refs.btn.setState({
                disabled: !refs.name.state.value
              });
            } else {
              refs.btn.setState({
                disabled: true
              });
            }
          } else {
            refs.btn.setState({
              disabled: !refs.name.state.value
            });
          }
          break;
        case 'endpoint':
          if(endpointChecked) {
            if(obj && obj.constructor === Array) {
              refs.btn.setState({
                disabled: !state.checked
              });
            } else if(obj && obj.constructor === Object) {
              refs.btn.setState({
                disabled: false
              });
            } else {
              if (refs.name.state.value !== '') {
                refs.btn.setState({
                  disabled: !refs.endpoint.refs.endpoints.state.showsubs.length
                });
              } else {
                refs.btn.setState({
                  disabled: true
                });
              }
            }
          } else {
            refs.btn.setState({
              disabled: !refs.name.state.value
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
