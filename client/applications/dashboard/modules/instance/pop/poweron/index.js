const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('../../request');

function pop(obj, parent, callback) {
  config.fields[0].info = __.confirm_inst_action.replace('{0}', __.ins_action_poweron);
  config.fields[1].data = obj;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      request.poweron(obj).then((res) => {
        cb(true);
        callback && callback(res);
      }).catch((err) => {
        let reg = new RegExp('"message":"(.*)","');
        let tip = reg.exec(err.response)[1];

        refs.error.setState({
          value: tip,
          hide: false
        });
        cb(false);
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
