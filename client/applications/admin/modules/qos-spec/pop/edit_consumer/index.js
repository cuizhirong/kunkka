var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/admin.lang.json');
var getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  let select = config.fields[0];
  select.data = ['back-end', 'front-end', 'both'].map((ele) => ({ id: ele, name: ele }));

  let index = select.data.findIndex(i => i.id === obj.consumer);
  if (index > -1) {
    select.data.splice(index, 1);
  }
  select.value = select.data[0].id;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {
        qos_specs: {
          consumer: refs.consumer.state.value
        }
      };

      request.updateQosSpec(obj.id, data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
