'use strict';

const co = require('co');
const models = require('../../models');
const PayModel = models.pay;
const request = require('superagent');
const payment = {
  paypal: require('../payment/paypal'),
  alipay: require('../payment/alipay')
};
const adminLogin = require('api/slardar/common/adminLogin');

const currency = require('config')('currency') || {
  ISO4217: 'CNY',
  name: '人民币',
  unit: '元'
};

function Pay(app) {
  this.app = app;
}

Pay.prototype = {
  //create payment
  pay: function(req, res, next) {
    co(function* () {
      if (!req.session || !req.session.user) {
        res.status(401).end();
        return;
      }
      let user = req.session.user.userId;
      let username = req.session.user.username;
      let method = req.params.method;
      let amount = req.query.amount;

      if (!payment[method]) {
        next({
          code: 'error',
          msg: req.i18n.__('api.pay.PaymentMethodError')
        });
        return;
      }
      let info = {
        user: user,
        username: username,
        method: method,
        amount: amount,
        currency: currency.ISO4217
      };
      let pay = yield PayModel.create(info);
      info.id = pay.id;
      payment[method].create(info, req, res);
    }).catch(next);
  },
  callback: function(req, res, next) {
    let method = req.params.method;
    let result = req.params.result;
    if (result !== 'success') {
      return res.json({
        code: 'error',
        msg: req.i18n.__('api.pay.PaymentFailed')
      });
    }
    if (payment[method]) {
      payment[method].execute(req, res, next).then(function() {
        next();
      }).catch(next);
    } else {
      next({
        code: 'error',
        msg: req.i18n.__('api.pay.PaymentMethodError')
      });
    }
  },
  //paypal execute and check
  paypalExecute: function(req, res, next) {
    let result = req.params.result;
    if (result !== 'success') {
      return res.json({
        code: 'error',
        msg: req.i18n.__('api.pay.PaymentFailed')
      });
    }

    payment.paypal.execute(req, res, next);
  },
  //payment success and notify from alipay
  alipayNotify: function(req, res, next) {
    co(function* () {
      let pay = yield payment.alipay.execute(req.body);
      req.query.uuid = pay.id;
      next();
    }).catch(next);
  },

  //recharge for users
  inform: function(req, res, next) {
    co(function* () {
      let pay = yield PayModel.findOne({where: {id: req.query.uuid}});
      if (pay.transferred === true && pay.informed === false) {
        let region = req.params.regionId;
        let loginRes = yield adminLogin();
        yield request.put(loginRes.remote.shadowfiend[region] + '/v1/accounts/' + pay.user)
        .set('X-Auth-Token', loginRes.token)
        .send({
          value: pay.amount,
          type: pay.method,
          come_from: pay.method,
          charge_time: new Date().toISOString()
        });
        pay.informed = true;
        yield pay.save();
        res.send('success');

      } else if (pay.transferred === true && pay.informed === true) {
        res.send('success');
      } else {
        next({
          code: 'error',
          msg: req.i18n.__('api.pay.RechargeFailed')
        });
      }
    }).catch(next);
  },

  initRoutes: function() {
    this.app.get('/api/pay/:method', this.pay.bind(this));
    this.app.post('/api/pay/alipay/notify/:regionId', this.alipayNotify.bind(this), this.inform.bind(this));
    this.app.get('/api/pay/paypal/:result', this.paypalExecute.bind(this), this.inform.bind(this));
  }

};

module.exports = Pay;
