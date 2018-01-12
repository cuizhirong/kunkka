'use strict';

const co = require('co');
const base = require('../base');
const models = require('../../models');
const userModel = models.user;

function Update (app){
  this.app = app;
  this.memClient = app.get('CacheClient');
}


Update.prototype = {
  initRoutes: function (){
    //Change name for user
    this.app.post(
      '/api/user/phone/captcha',
      base.middleware.checkLogin,
      base.middleware.checkCaptcha,
      base.middleware.adminLogin,
      this.sendPhoneCaptha.bind(this),
      base.middleware.customResApi
    );
    //Change password for user
    this.app.post(
      '/api/user/phone',
      base.middleware.checkLogin,
      this.bindPhone.bind(this),
      base.middleware.customResApi
    );

  },
  sendPhoneCaptha: function(req, res, next) {
    const that = this;
    co(function* () {
      const phone = parseInt(req.body.phone, 10);
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return next({customRes: true, status: 400, msg: 'PhoneError'});
      }
      const user = yield base.func.verifyUserAsync(req.admin.token, {phone});
      if (user) {
        next({customRes: true, status: 400, msg: 'Used'});
      } else {
        next(yield base.func.phoneCaptchaMemAsync({
          phone, usage: 'usageBind',
          __: req.i18n.__.bind(req.i18n), memClient: that.memClient
        }));
      }
    }).catch(next);
  },
  bindPhone: function (req, res, next) {
    const that = this;
    co(function* () {
      let phone = parseInt(req.body.phone, 10);
      let code = req.body.code;
      let isCurrent = yield base.mem.verifyKeyValueAsync(phone, code, that.memClient);
      if (!isCurrent) {
        return next({status: 400, customRes: true, location: ['code'], msg: 'CodeError'});
      }
      let user = yield userModel.findOne({where: {phone}});
      if (user && user.id !== req.session.user.userId) {
        return next({customRes: true, status: 400, msg: 'Used'});
      }
      yield userModel.update({phone}, {where: {id: req.session.user.userId}});
      res.end();
    }).catch(next);
  }
};

module.exports = Update;
