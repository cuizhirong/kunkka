const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.rawItem.name || '(' + obj.rawItem.id.substr(0, 8) + ')';
  config.fields[2].text = obj.childItem.name + '(' + obj.childItem.cidr + ')';

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.detachSubnet(obj).then(() => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, state, refs) {},
    onLinkClick: function() {}
  };

  commonModal(props);
}

module.exports = pop;
