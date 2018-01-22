'use strict';
const co = require('co');
const uuid = require('node-uuid');
const base = require('../base');
const drivers = require('drivers');
const config = require('config');
const keystoneRemote = config('keystone');
const updateUserAsync = drivers.keystone.user.updateUserAsync;
const passwordModel = require('../../models').user_password;
const userModel = require('../../models').user;
const changePasswordAsync = drivers.keystone.user.changePasswordAsync;

function Password(app) {
  this.app = app;
  this.memClient = app.get('CacheClient');
}

Password.prototype = {

  pageResetPassword: (req, res, next) => next({customRes: true, status: 200, view: 'findPwd'}),
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
        next(yield base.func.phoneCaptchaMemAsync({
          phone, usage: 'usageResetPassword',
          __: req.i18n.__.bind(req.i18n), memClient: that.memClient
        }));
      }

    }).catch(next);
  },
  resetViaPhone: function (req, res, next) {
    const that = this;
    co(function *() {
      let phone = req.body.phone;
      let code = parseInt(req.body.captcha, 10);
      let password = req.body.pwd;
      password = base.crypto.decrypt(password, req.session.passwordId);
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return next({msg: 'PhoneError', customRes: true, status: 400});
      }

      let isCorrect = yield base.mem.verifyKeyValueAsync(phone, code, that.memClient);
      if (!isCorrect) {
        return next({msg: 'CodeError', customRes: true, status: 400});
      }

      let user = yield base.func.verifyUserAsync(req.admin.token, {phone});
      if (!user) {
        return next({customRes: true, status: 400, msg: 'UserNotExist'});
      }

      let enableSafety = yield base._getSetBool('admin', 'enable_safety');
      if (enableSafety) {
        const isAvailable = yield base.func.checkPasswordAvailable(user.id, password);
        if (!isAvailable) {
          return next({customRes: true, status: 400, msg: 'cannotUseHistoricalPassword'});
        }
      }

      //CREATE PASSWORD TO DATABASE
      const passworHash = yield base.crypto.hash(password);
      yield [
        passwordModel.create({userId: user.id, password: passworHash}),
        updateUserAsync(req.admin.token, keystoneRemote, user.id, {user: {password}}),
        that.memClient.deleteAsync(phone.toString())
      ];

      next({msg: 'ResetSuccess', customRes: true, status: 200});
    }).catch(next);
  },
  //Change self password
  changeMyselfPassword: function (req, res, next) {
    const that = this;
    co(function* () {
      const userId = req.session.user.userId;
      let password = req.body.password;
      password = base.crypto.decrypt(password, req.session.passwordId);
      let originalPassword = req.body.original_password;
      originalPassword = base.crypto.decrypt(originalPassword, req.session.passwordId);

      let enableSafety = yield base._getSetBool('admin', 'enable_safety');
      if (enableSafety) {
        const phone = req.session.user.phone;
        const code = parseInt(req.body.captcha, 10);
        let isPhoneCorrect = yield base.mem.verifyKeyValueAsync(phone, code, that.memClient);
        if (!isPhoneCorrect) {
          return next({msg: 'CodeError', customRes: true, status: 400});
        }

        const isAvailable = yield base.func.checkPasswordAvailable(userId, password);
        if (!isAvailable) {
          return next({customRes: true, status: 400, msg: 'cannotUseHistoricalPassword'});
        }
      }

      yield changePasswordAsync(
        req.session.user.token, keystoneRemote, userId,
        {user: {password, original_password: originalPassword}}
      );

      //CREATE PASSWORD TO DATABASE
      const passworHash = yield base.crypto.hash(password);
      yield passwordModel.create({userId, password: passworHash});
      res.end();
    }).catch(next);
  },
  sendCaptchaNoPhone: function (req, res, next) {
    const that = this;
    co(function *() {
      const user = yield userModel.findOne({where: {id: req.session.user.userId}});
      let phone = user && user.phone;
      if (!phone) {
        return next({customRes: true, msg: 'dontHavePhone'});
      }

      req.session.user.phone = phone;
      next(yield base.func.phoneCaptchaMemAsync({
        phone, usage: 'usageResetPassword',
        __: req.i18n.__.bind(req.i18n), memClient: that.memClient
      }));
    });
  },
  getUUID: function (req, res, next) {
    let passwordId = req.session.passwordId = uuid();
    res.send({uuid: passwordId});
  },

  initRoutes: function () {
    this.app.get(
      '/auth/password',
      this.pageResetPassword.bind(this),
      base.middleware.customResPage
    );
    this.app.post(
      '/api/password/reset/phone-captcha',
      base.middleware.checkCaptcha,
      base.middleware.adminLogin,
      this.sendCaptcha.bind(this),
      base.middleware.customResApi
    );
    this.app.post(
      '/auth/password/reset',
      base.middleware.adminLogin,
      this.resetViaPhone.bind(this),
      base.middleware.customResPage
    );
    this.app.post(
      '/api/password/reset',
      base.middleware.adminLogin,
      this.resetViaPhone.bind(this),
      base.middleware.customResApi
    );
    this.app.post(
      '/api/password/change',
      base.middleware.checkLogin,
      this.changeMyselfPassword.bind(this),
      base.middleware.customResApi
    );
    this.app.post(
      '/api/password/change/phone-captcha',
      base.middleware.checkLogin,
      this.sendCaptchaNoPhone.bind(this),
      base.middleware.customResApi
    );
    this.app.get('/api/password/uuid', this.getUUID);
  }
};

module.exports = Password;
