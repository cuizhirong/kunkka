'use strict';
const models = require('../../models');
const PayModel = models.pay;
const crypto = require('crypto');

const config = require('config');
const currencyConfig = config('currency') || {ISO4217: 'CNY', name: '人民币', unit: '元'};
const queryOptions = config('alipay');

const gateway = queryOptions.gateway;
const partnerKey = queryOptions.partnerKey;
const charset = queryOptions._input_charset;
const alipaySubject = queryOptions.subject;
const alipayBody = queryOptions.body;
delete queryOptions.partnerKey;
delete queryOptions.gateway;
delete queryOptions.subject;
delete queryOptions.body;


const _getPreStr = function (options) {
  return Object.keys(options || {}).sort().map(key=> {
    if (!(key === 'sign' || key === 'sign_type' || options[key] === '')) {
      return key + '=' + options[key];
    } else {
      return false;
    }
  }).filter(option=>option).join('&');
};
const _md5Sign = function (preStr) {
  return crypto.createHash('md5').update(preStr + partnerKey, charset).digest('hex');
};


module.exports = {
  create: function (info, req, res) {
    let data = {
      out_trade_no: info.id,
      total_fee: info.amount,
      currency: info.currency,
      notify_url: req.protocol + '://' + req.hostname + '/api/pay/alipay/notify/' + req.session.user.regionId,
      subject: alipaySubject + info.username,
      body: alipayBody + info.amount + currencyConfig.unit
    };

    Object.assign(data, queryOptions);

    let preStr = _getPreStr(data);
    let sign = _md5Sign(preStr);

    res.redirect(encodeURI(gateway + preStr + '&sign=' + sign + '&sign_type=MD5'));
  },


  //save database,
  execute: function* (reqBody) {
    let status = reqBody.trade_status;
    if (status === 'TRADE_FINISHED' || status === 'TRADE_SUCCESS') {
      let preStr = _getPreStr(reqBody);
      let mySign = _md5Sign(preStr);

      if (mySign !== reqBody.sign) {
        throw new Error('sign error');
      }
      let pay = yield PayModel.findOne({
        where: {id: reqBody.out_trade_no}
      });

      if (!pay) {
        throw new Error('Not Found');
      }
      pay.transferred = true;
      yield pay.save();
      return pay;
    } else {
      throw new Error('charge failed');
    }

  }
};
