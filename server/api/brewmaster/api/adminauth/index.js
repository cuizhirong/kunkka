'use strict';
const co = require('co');
const base = require('../base');

function Password(app) {
  this.app = app;
  this.memClient = app.get('CacheClient');
}

Password.prototype = {
  pageLogin: (req, res, next) => {
    next({customRes: true, status: 200, view: 'admin-login'});
  },
  pageReauth: function (req, res, next) {
    const that = this;
    const __ = req.i18n.__.bind(req.i18n);
    co(function* () {
      let enableSafety = yield base._getSetBool('admin', 'enable_safety');
      //judge
      if (!enableSafety || req.session.user.authAdmin) {
        res.redirect(req.query.cb || '/admin');
        return;
      }
      let phone = req.session.user.phone;
      if (!phone) {
        next({customRes: true, status: 400, msg: 'dontHavePhone', view: 'single'});
        return;
      }

      //send sms
      let result = yield base.func.phoneCaptchaMemAsync({
        __, usage: 'usageReauth',
        phone, memClient: that.memClient
      });
      //render
      if (result.msg === 'SendSmsSuccess' || result.msg === 'Frequently') {
        next({customRes: true, status: 200, view: 'admin-reauth'});
      } else {
        next({customRes: true, status: 500, msg: 'smsSendError', view: 'single'});
      }
    }).catch(next);
  },
  sendCaptcha: function (req, res, next) {
    const that = this;
    const __ = req.i18n.__.bind(req.i18n);
    co(function *() {
      let enableSafety = yield base._getSetBool('admin', 'enable_safety');
      //judge
      if (!enableSafety || req.session.user.authAdmin) {
        next({status: 400, customRes: true, msg: 'badRequest'});
        return;
      }
      let phone = req.session.user.phone;
      if (!phone) {
        next({customRes: true, status: 400, msg: 'dontHavePhone'});
        return;
      }
      //send sms
      let result = yield base.func.phoneCaptchaMemAsync({
        __, usage: 'usageReauth',
        phone, memClient: that.memClient
      });
      //render
      if (result.msg === 'SendSmsSuccess' || result.msg === 'Frequently') {
        next({customRes: true, status: 200, msg: 'success'});
      } else {
        next({customRes: true, status: 500, msg: 'smsSendError'});
      }
    }).catch(next);
  },
  reauth: function (req, res, next) {
    const that = this;
    co(function *() {
      let code = parseInt(req.body.captcha, 10);
      let phone = req.session.user.phone;

      let isCorrect = yield base.mem.verifyKeyValueAsync(phone, code, that.memClient);
      if (!isCorrect) {
        next({customRes: true, status: 400, msg: 'CodeError', view: 'admin-reauth'});
        return;
      }
      req.session.user.authAdmin = true;
      res.end();
    }).catch(next);
  },

  initRoutes: function () {
    this.app.get(
      '/auth/admin-reauth',
      this.pageReauth.bind(this),
      base.middleware.customResPage
    );
    this.app.post(
      '/api/auth/admin-reauth/phone-captcha',
      this.sendCaptcha.bind(this),
      base.middleware.customResApi
    );
    this.app.post(
      '/api/auth/admin-reauth',
      this.reauth.bind(this),
      base.middleware.customResApi
    );
  }
};

module.exports = Password;
