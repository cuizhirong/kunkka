'use strict';

const models = require('../../models');
const PayModel = models.pay;
const request = require('request');
const payment = {
  paypal: require('../payment/paypal'),
  alipay: require('../payment/alipay')
};

const currency = require('config')('currency') || {ISO4217: 'CNY', name: '人民币', unit: '元'};


function Pay (app) {
  this.app = app;
}

Pay.prototype = {

  //create payment
  pay: function (req, res, next) {
    let user = req.session.user.userId;
    let username = req.session.user.username;
    let method = req.params.method;
    let amount = req.body.amount;
    let info = {
      user: user,
      username: username,
      method: method,
      amount: amount,
      currency: currency.ISO4217
    };
    PayModel.create(info).then(function (pay) {
      info.id = pay.id;
      if (payment[method]) {
        payment[method].create(info, req, res);
      } else {
        next({code: 'error', msg: req.i18n.__('api.pay.PaymentMethodError')});
      }
    }).catch(next);

  },


  callback: function (req, res, next) {
    let method = req.params.method;
    let result = req.params.result;
    if (result !== 'success') {
      return res.json({code: 'error', msg: req.i18n.__('api.pay.PaymentFailed')});
    }
    if (payment[method]) {
      payment[method].execute(req, res, next).then(function () {
        next();
      }).catch(next);
    } else {
      next({code: 'error', msg: req.i18n.__('api.pay.PaymentMethodError')});
    }
  },

  //paypal execute and check
  paypalExecute: function (req, res, next) {
    let result = req.params.result;
    if (result !== 'success') {
      return res.json({code: 'error', msg: req.i18n.__('api.pay.PaymentFailed')});
    }

    payment.paypal.execute(req, res, next);
  },

  //payment success and notify from alipay
  alipayNotify: function (req, res, next) {
    if (req.body.trade_status === 'TRADE_FINISHED') {
      payment.alipay.execute(req, res, next).then(function () {
        req.query.uuid = req.body.out_trade_no;
        next();
      });
    } else {
      next(req.body);
    }
  },

  //recharge for users
  inform: function (req, res, next) {
    let _paymentIsAlipay = req.route.path.indexOf('alipay') > -1;
    let region = req.header('REGION') || req.body.REGION;

    PayModel.findOne({where: {id: req.query.uuid}}).then(pay=> {
      if (pay.transferred === 1 && pay.informed === 0) {
        request.put({
          url: req.session.endpoint.gringotts[region] + '/v2/accounts/' + req.session.user.userId,
          body: {
            value: pay.amount,
            type: pay.method,
            come_form: pay.method
          }
        }, function (err, response, body) {
          if (err) {
            next(err);
          }
          pay.informed = 1;
          pay.save().then(function (result) {
            if (_paymentIsAlipay) {
              res.end('success');
            } else {
              res.json(result);
            }
          }).catch(next);
        });
      } else if (pay.transferred === 1 && pay.informed === 1) {
        res.json({code: 'error', msg: req.i18n.__('api.pay.TransactionHadBeenCompleted')});
      } else {
        next({code: 'error', msg: req.i18n.__('api.pay.RechargeFailed')});
      }

    }).catch(err=> {
      next(err);
    });
  },

  initRoutes: function () {
    this.app.post('/api/pay/:method', this.pay);
    this.app.post('/api/pay/alipay/notify', this.alipayNotify, this.inform);
    this.app.get('/api/pay/paypal/:result', this.paypalExecute, this.inform);
  }

};


module.exports = Pay;
