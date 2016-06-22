var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

function pop(obj, parent, callback) {
  var names = obj.map((ele) => '\'' + ele.name + '\'').join(', ');
  config.fields[0].info = __[config.fields[0].field].replace('{0}', names);

  var props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      request.poweroff(obj).then((res) => {
        cb(true);
        callback && callback(res);
      }).catch((err) => {
        var reg = new RegExp('"message":"(.*)","');
        var tip = reg.exec(err.response)[1];

        refs.error.setState({
          value: tip,
          hide: false
        });
        cb(false);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
