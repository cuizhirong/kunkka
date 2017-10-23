const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop({ volumeType, encryption }, parent, callback) {

  let name = config.fields[0];
  let provider = config.fields[1];
  let controlLocation = config.fields[2];
  let cipher = config.fields[3];
  let keySize = config.fields[4];

  name.text = volumeType.name;
  if (encryption) {
    config.title = ['edit', 'encryption'];
    config.btn.disabled = false;

    provider.value = encryption.provider;
    controlLocation.value = encryption.control_location;
    cipher.value = encryption.cipher;
    keySize.value = encryption.key_size;
  } else {
    config.title = ['create', 'encryption'];
    config.btn.disabled = true;

    provider.value = '';
    controlLocation.value = controlLocation.data[0].id;
    cipher.value = '';
    keySize.value = '';
  }

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let _encryption = {};
      let _cipher = refs.cipher.state.value;
      let _keySize = Number(refs.key_size.state.value);

      _encryption.provider = refs.provider.state.value;
      _encryption.control_location = refs.control_location.state.value;

      _encryption.cipher = _cipher ? _cipher : null;
      _encryption.key_size = _keySize ? _keySize : null;

      let data = {
        encryption: _encryption
      };

      if (encryption) {
        request.updateEncryption(volumeType.id, encryption.encryption_id, data).then((res) => {
          callback && callback(res);
          cb(true);
        }).catch((err) => {
          cb(false, getErrorMessage(err));
        });
      } else {
        request.createEncryption(volumeType.id, data).then((res) => {
          callback && callback(res);
          cb(true);
        }).catch((err) => {
          cb(false, getErrorMessage(err));
        });
      }
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'provider':
        case 'key_size':
          let isValidProvider = refs.provider.state.value;
          let keySizeValue = refs.key_size.state.value;
          let isValidSize = !keySizeValue || !isNaN(keySizeValue) && (Number.isInteger(Number(keySizeValue)) > 0);

          refs.key_size.setState({
            error: !isValidSize
          });
          refs.btn.setState({
            disabled: !(isValidProvider && isValidSize)
          });
          break;
        default:
          return;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
