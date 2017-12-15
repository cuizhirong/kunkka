const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const React = require('react');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function Info(props) {
  const style = {
    paddingLeft: 36,
    lineHeight: '24px'
  };
  return (
    <div style={style}>{props.info}</div>
  );
}

function renderer(state) {
  return <Info {...state} />;
}

function pop(obj, callback) {
  const namespace = obj.namespace;

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {

      const info = __.will_delete_namespace + ' "' + namespace + '". ' + __.confirm_action + __.action_cannot_undone;

      refs.text.setState({
        renderer: renderer,
        info: info
      });
    },
    onConfirm: function(refs, cb) {
      request.deleteNamespace(namespace).then((res) => {
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
