'use strict';

const paypal = require('paypal-rest-sdk');
const PayModel = require('../../models').pay;

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
        'return_url': req.protocol + '://' + req.hostname + '/api/pay/paypal/success?order=' + info.id,
        'cancel_url': req.protocol + '://' + req.hostname + '/api/pay/paypal/cancel?order=' + info.id
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
      } else {

        PayModel.findOne({
          where: {id: req.query.order}
        }).then(pay=> {
          pay.paymentId = paymentId;
          pay.save();
        }).then(function () {
          let payer = {payer_id: payerId};

          paypal.payment.execute(paymentId, payer, function (executeErr, executeResult) {

            if (executeErr && executeErr.code === 'ECONNRESET') {
              module.exports.moreRequest(paymentId, module.exports.save);
            } else if (executeErr) {
              next(executeErr);
            } else if (executeResult.state === 'approved') {
              module.exports.save();
            }
          });
        });
      }

    }
  },

  save: function (req, res, next) {
    PayModel.findOne({
      where: {id: req.query.order}
    }).then(pay=> {
      pay.transferred = 1;
      return pay.save();
    }).then(()=> {
      req.query.uuid = req.query.order;
      next();
    });
  },
  moreRequest: function (id, cb) {
    let times = [0, 5, 10, 20, 40, 60];
    let timeouts = [];

    times.forEach(function (time, index) {
      timeouts[index] = setTimeout(function () {
        paypal.payment.get(id, function (queryErr, queryResult) {
          if ((!queryErr) || ( queryErr && queryErr.httpStatusCode)) {
            cb(queryErr, queryResult);
            timeouts.forEach(out=> {
              clearTimeout(out);
            });
          }
        });
      }, time * 60000);
    });
  }
};
