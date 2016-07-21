'use strict';

const Promise = require('bluebird');
const paypal = require('paypal-rest-sdk');

paypal.configure(require('config')('paypal').live);

module.exports = {
  create: function (info, req, res) {
    let paypalPayment = {
      'intent': 'sale',
      'payer': {
        'payment_method': 'paypal'
      },
      'transactions': [
        {
          'amount': {
            'currency': info.currency,
            'total': info.amount.toString()
          },
          'description': 'Recharge',
          'item_list': {
            'items': [{
              'name': 'Recharge',
              'sku': 'item',
              'price': info.amount.toString(),
              'currency': info.currency,
              'quantity': 1
            }]
          }
        }
      ],
      'redirect_urls': {
        'return_url': req.protocol + '://' + req.hostname + '/api/pay/callback/paypal/success?order=' + info.id,
        'cancel_url': req.protocol + '://' + req.hostname + '/api/pay/callback/paypal/cancel?order=' + info.id
      }
    };
    paypal.payment.create(paypalPayment, {}, function (err, result) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(result);
      }
    });
  },
  execute: function (req, res, next) {
    let payerId = req.query.PayerID;
    let paymentId = req.query.paymentId;
    let token = req.query.token;
    let cancel = req.params.result !== 'success';
    if (cancel) {
      next({code: -1, msg: req.i18n.__('api.pay.cancelPayment')});
    } else {
      if (!payerId || !paymentId || !token) {
        next({code: -1, msg: req.i18n.__('api.pay.parameterError')});
      }
      let payer = {payer_id: payerId};
      let paypalExecute = Promise.promisify(paypal.payment.execute);
      return paypalExecute(paymentId, payer, {});
    }
  }
};
