const commonModal = require('client/components/modal_common/index');
const React = require('react');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const info = require('./info.jsx');
const QuotaDetail = require('../../detail/quota_detail.jsx');
const getErrorMessage = require('../../../../utils/error_message');

function quotaDetailRenderer(props) {
  return <QuotaDetail {...props} />;
}

function pop(obj, callback) {

  let props = {
    __: __,
    config: config,
    width: 814,
    onInitialize: function(refs) {
      refs.agree.setState({
        renderer: info,
        accountName: obj.user.name,
        __: __
      });
      refs['quota-info'].setState({
        renderer: quotaDetailRenderer,
        addedQuota: obj.addedQuota,
        originQuota: obj.originQuota
      });
    },
    onConfirm: function(refs, cb) {
      request.agreeApplication(obj.id).then((res) => {
        callback && callback();
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
