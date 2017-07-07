var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  let name = config.fields[0];
  let description = config.fields[1];
  let isPublic = config.fields[2];

  if (obj) {
    config.title = ['edit', 'type'];
    config.btn.disabled = false;

    name.value = obj.name;
    description.value = obj.description;
    isPublic.checked = obj['os-volume-type-access:is_public'];
  } else {
    config.title = ['create', 'type'];
    config.btn.disabled = true;

    name.value = '';
    description.value = '';
    isPublic.checked = true;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let isChecked = refs.volume_type_public.state.checked;
      let data = {
        volume_type: {
          name: refs.name.state.value,
          description: refs.description.state.value
        }
      };

      if (obj) {
        data.volume_type.is_public = isChecked;
        request.updateType(obj.id, data).then((res) => {
          callback && callback(res);
          cb(true);
        }).catch((err) => {
          cb(false, getErrorMessage(err));
        });
      } else {
        data.volume_type['os-volume-type-access:is_public'] = isChecked;
        request.createType(data).then((res) => {
          callback && callback(res);
          cb(true);
        }).catch((err) => {
          cb(false, getErrorMessage(err));
        });
      }
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'name':
          refs.btn.setState({
            disabled: !state.value
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
