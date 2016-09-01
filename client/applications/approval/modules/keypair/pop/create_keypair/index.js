var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var getErrorMessage = require('client/applications/approval/utils/error_message');
var __ = require('locale/client/approval.lang.json');

function pop(parent, callback) {
  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      var data = {};
      var name = refs.name.state.value;
      if (refs.type.state.value === 'create_keypair') {
        data = {
          name: name
        };
        request.createKeypair(data).then((res) => {
          var container = document.getElementById('modal-container').getElementsByClassName('modal')[0];
          var linkNode = document.createElement('a');
          if (linkNode.download !== undefined) {
            linkNode.download = res.name + '.pem';
          }
          linkNode.href = 'data:application/x-pem-file,' + encodeURIComponent(res.private_key);
          container.appendChild(linkNode);
          linkNode.click();
          callback && callback(res);
          cb(true);
        });
      } else {
        data = {
          name: name,
          public_key: refs.public_key.state.value
        };
        request.createKeypair(data).then((res) => {
          callback && callback(res);
          cb(true);
        }).catch(function(error) {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(filed, state, refs) {
      var name = refs.name.state;
      switch (filed) {
        case 'type':
          refs.public_key.setState({
            hide: state.value === 'create_keypair'
          });
          break;
        case 'name':
          if(name.error === true && name.value === '') {
            refs.name.setState({
              error: false
            });
          }
          break;
        default:
          break;
      }
      refs.btn.setState({
        disabled: !(!name.error && name.value)
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
