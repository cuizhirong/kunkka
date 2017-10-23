const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const __ = require('locale/client/dashboard.lang.json');

function pop(parent, callback) {
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let name = refs.name.state.value;
      let authAlgorithm = refs.auth_algorithm.state.value;
      let encryptionAlgorighm = refs.encryption_algorithm.state.value;
      let ikeVersion = refs.ike_version.state.value;
      let pfs = refs.pfs.state.value;
      let saLifetime = refs.sa_lifetime.state.value;

      let data = {
        ikepolicy: {
          phase1_negotiation_mode: 'main',
          auth_algorithm: authAlgorithm,
          encryption_algorithm: encryptionAlgorighm,
          pfs: pfs,
          lifetime: {
            units: 'seconds',
            value: saLifetime
          },
          ike_version: ikeVersion,
          name: name
        }
      };

      request.createPolicy(data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch(function(error) {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(filed, state, refs) {
      switch (filed) {
        case 'name':
          let regexName = /^[a-z1-9A-Z_.]{1,}$/;
          if(regexName.test(state.value)) {
            refs.name.setState({
              error: false
            });
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.name.setState({
              error: true
            });
            refs.btn.setState({
              disabled: true
            });
          }
          break;
        case 'sa_lifetime':
          let regexLifetime = /^[1-9.]{1,}$/;
          if(regexLifetime.test(state.value)) {
            refs.sa_lifetime.setState({
              error: false
            });
            refs.btn.setState({
              disabled: false
            });
          } else {
            refs.sa_lifetime.setState({
              error: true
            });
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
