var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var React = require('react');

function pop(obj, parent, callback) {

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      refs.display_box.setState({
        value: (
          <span>
            <i className="glyphicon icon-instance"></i>
            {obj.name}
          </span>
        )
      });
    },
    onConfirm: function(refs, cb) {
      request.forceDelete(obj.id).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        case 'confirm_force_delete':
          refs.btn.setState({
            disabled: !state.checked
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
