const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, callback) {

  let props = {
    __: __,
    config: config,
    width: 400,
    onInitialize: function(refs) {
      const visibility = obj.visibility;
      const isProtected = obj.protected;

      refs.public.setState({
        checked: visibility === 'public' ? true : false
      });
      refs.protected.setState({
        checked: isProtected
      });
    },
    onConfirm: function(refs, cb) {
      const visibility = refs.public.state.checked ? 'public' : 'private';
      const isProtected = refs.protected.state.checked ? true : false;

      request.updateNamespace(obj, visibility, isProtected).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function() {}
  };

  commonModal(props);
}

module.exports = pop;
