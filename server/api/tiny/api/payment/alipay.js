'use strict';
const models = require('../../models');
const PayModel = models.pay;
const request = require('request');
const xml2json = require('xml2json');
const md5 = require('md5');
const allConfig = require('config')('alipay');

const commonData = {
  partner: allConfig.common.partner,
  _input_charset: allConfig.common._input_charset
};
const gateway = allConfig.common.gateway;
const partnerKey = allConfig.common.partnerKey;

module.exports = {
  create: function (info, req, res) {
    let data = {
      out_trade_no: info.id,
      total_fee: info.amount,
      currency: info.currency,
      notify_url: req.protocol + '://' + req.hostname + '/api/pay/alipay/notify?REGION=' + req.header('REGION'),
      return_url: req.protocol + '://' + req.hostname + '/api/pay/alipay/return'
    };

    Object.assign(data, allConfig.forex, commonData);

    var ret = Object.keys(data).sort().map((el) => {
      return el + '=' + data[el];
    }).join('&');

    let sign = md5(ret + partnerKey);

    res.send({url: gateway + ret + '&sign=' + sign + '&sign_type=MD5'});
  },


  //save database,
  execute: function (req, res, next) {
    return PayModel.findOne({
      where: {id: req.body.out_trade_no}
    }).then(pay=> {
      pay.transferred = 1;
      return pay.save();
    }).catch(err=> {
      next(err);
    });
  },

  returnUrl: function (req, res, next) {

    let data = {
      out_trade_no: req.query.out_trade_no
    };
    Object.assign(data, allConfig.query, commonData);

    var ret = Object.keys(data).sort().map((el) => {
      return el + '=' + data[el];
    }).join('&');

    let sign = md5(ret + partnerKey);

    request(gateway + ret + '&sign=' + sign + '&sign_type=MD5').then(function (response) {
      let result = xml2json.toJson(response.body);
      if (result.alipay && result.alipay.is_success === 'T') {
        req.send(result.alipay);
      } else {
        next(result);
      }
    });

  }
};
