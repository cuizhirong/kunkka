'use strict';

let base = require('../base');
const drivers = require('drivers');
const config = require('config');
const keystoneRemote = config('keystone');
let updateUser = drivers.keystone.user.updateUser;
let memcachedClient;

function Password(app) {
  this.app = app;
  memcachedClient = app.get('CacheClient');
}


Password.prototype = {

  pageForget: function (req, res, next) {
    base.func.getTemplateObj((err, obj)=> {
      if (err) {
        obj.subtitle = obj.message = req.i18n.__('api.register.SystemError');
        res.render('single', obj);
      } else {
        obj.subtitle = req.i18n.__('api.register.RetrievePassword');
        obj.locale = req.i18n.locale;
        res.render('findPwd', obj);
      }
    });

  },
  sendCaptcha: function (req, res, next) {

    let __ = req.i18n.__.bind(req.i18n);

    let phone = req.body.phone;
    if (!(/^1[34578]\d{9}$/.test(phone))) {
      res.status(500).send(__('api.register.PhoneError'));
      return false;
    }
    base.func.verifyUser(req.admin.token, {phone: phone}, function (err, userExist, user) {
      if (err) {
        next({type: 'SystemError', err: err});
      } else if (userExist) {
        base.func.phoneCaptchaMem(phone, memcachedClient, req, res, next);
      } else {
        res.send({type: 'message', message: __('api.register.UserNotExist')});
      }
    });
  },
  resetViaPhone: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let phone = req.body.phone;
    let code = parseInt(req.body.captcha, 10);
    let password = req.body.pwd;
    if (!(/^1[34578]\d{9}$/.test(phone))) {
      return next({message: __('api.register.PhoneError'), type: 'message'});
    }

    function render(result) {
      base.func.getTemplateObj((err, obj)=> {
        if (err) {
          obj.subtitle = obj.message = __('api.register.SystemError');
          result.status = 500;
        } else {
          obj.subtitle = __('views.auth.forgotPass');
          obj.message = result.message;
        }
        res.status(result.status).render('single', obj);
      });

    }

    memcachedClient.get(phone.toString(), (err, val)=> {
      if (err) {
        render({status: 500, message: __('api.register.SystemError')});
      } else {
        val = val && val.toString();
        try {
          val = JSON.parse(val);
        } catch (e) {
          return render({status: 500, message: __('api.register.SystemError')});
        }

        if (parseInt(val.code, 10) !== code) {
          render({status: 500, message: __('api.register.CodeError')});
        } else {
          base.func.verifyUser(req.admin.token, {phone: phone}, function (error, userExist, user) {
            if (error) {
              render({status: 500, message: __('api.register.SystemError')});
            } else if (userExist) {
              updateUser(req.admin.token, keystoneRemote, user.id, {user: {password: password}}, function (e, r) {
                if (e) {
                  render({status: e.status, message: __('api.register.SystemError')});
                } else {
                  render({status: 200, message: __('api.register.ResetSuccess')});
                }
              });
            } else {
              render({status: 500, message: __('api.register.UserNotExist')});
            }
          });
        }

      }
    });
  },

  initRoutes: function () {
    this.app.get('/auth/password', this.pageForget.bind(this));
    this.app.post('/api/password/phone/captcha', base.middleware.adminLogin, this.sendCaptcha.bind(this));
    this.app.post('/auth/password/phone/reset', base.middleware.adminLogin, this.resetViaPhone.bind(this));
  }
};

module.exports = Password;
