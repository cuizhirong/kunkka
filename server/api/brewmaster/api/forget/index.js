'use strict';
const co = require('co');

const base = require('../base');
const drivers = require('drivers');
const config = require('config');
const keystoneRemote = config('keystone');
const updateUserAsync = drivers.keystone.user.updateUserAsync;

function Password(app) {
  this.app = app;
  this.memClient = app.get('CacheClient');
}

Password.prototype = {

  pageForget: (req, res, next) => {
    next({customRes: true, status: 200, view: 'findPwd'});
  },
  sendCaptcha: function (req, res, next) {
    const that = this;
    co(function *() {
      let phone = req.body.phone;
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return next({msg: 'PhoneError', customRes: true, status: 400});
      }

      let user = yield base.func.verifyUserAsync(req.admin.token, {phone});
      if (!user) {
        next({msg: 'UserNotExist', customRes: true, status: 400});
      } else {
        base.func.phoneCaptchaMemAsync(phone, that.memClient, req, res, next);
      }

    }).catch(next);
  },
  resetViaPhone: function (req, res, next) {
    const that = this;
    co(function *() {
      let phone = req.body.phone;
      let code = parseInt(req.body.captcha, 10);
      let password = req.body.pwd;
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return next({msg: 'PhoneError', customRes: true, status: 400});
      }

      let isCorrect = yield base.func.verifyKeyValueAsync(phone, code, that.memClient);
      if (!isCorrect) {
        return next({msg: 'CodeError', customRes: true, status: 400});
      }

      let user = yield yield base.func.verifyUserAsync(req.admin.token, {phone});
      if (!user) {
        return next({customRes: true, status: 400, msg: 'UserNotExist'});
      }
      yield [
        updateUserAsync(req.admin.token, keystoneRemote, user.id, {user: {password}}),
        that.memClient.deleteAsync(phone.toString())
      ];

      next({msg: 'ResetSuccess', customRes: true, status: 200});
    }).catch(next);
  },

  initRoutes: function () {
    this.app.get(
      '/auth/password',
      this.pageForget.bind(this),
      base.middleware.customResPage
    );
    this.app.post(
      '/api/password/phone/captcha',
      base.middleware.adminLogin,
      this.sendCaptcha.bind(this),
      base.middleware.customResApi
    );
    this.app.post(
      '/auth/password/phone/reset',
      base.middleware.adminLogin,
      this.resetViaPhone.bind(this),
      base.middleware.customResPage
    );
  }
};

module.exports = Password;
