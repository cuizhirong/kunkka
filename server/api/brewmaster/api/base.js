'use strict';
const config = require('config');
const region = config('region');
const Promise = require('bluebird');
const uuid = require('uuid');
const glob = require('glob');

const drivers = require('drivers');
const userModel = require('../models').user;
const getSettingsByApp = require('api/tusk/dao').getSettingsByApp;

const regionId = (region && region[0] && region[0].id) || 'RegionOne';
const keystoneRemote = config('keystone');
const tokenExpire = config('reg_token_expire') || 60 * 60 * 24;
const smsCodeExpire = config('reg_sms_expire') || 60 * 10;

const adminLogin = require('api/slardar/common/adminLogin');
const getUser = Promise.promisify(drivers.keystone.user.getUser);
const listUsers = drivers.keystone.user.listUsers;

const base = {func: {}, middleware: {}};

base.func.verifyUser = function (adminToken, where, cb) {
  if (cb && typeof cb === 'function') {
    let user;
    userModel.findOne({where: where}).then(userDB=> {
      user = userDB;
      if (!userDB) {
        return Promise.reject('userNotExist');
      } else {
        return getUser(adminToken, keystoneRemote, userDB.id).then(()=> {
          cb(null, true, user);
        });
      }
    }).catch(err=> {
      if (err.status === 404 && user) {
        user.destroy().then(function () {
          cb(null, false);
        }).catch(cb);
      } else if (err === 'userNotExist') {
        cb(null, false);
      } else {
        cb(err);
      }
    });
  }
};

base.func.verifyByName = function (adminToken, name, cb) {
  if (typeof cb === 'function') {
    listUsers(adminToken, keystoneRemote, (err, result)=> {
      if (err) {
        cb(err);
      } else {
        let users = result.body.users;
        if (Array.isArray(users) && users.length) {
          cb(null, true, users[0]);
        } else {
          userModel.destroy({where: {name: name}}).then(function () {
            cb(null, false);
          }).catch(cb);
        }
      }
    }, {name: name});
  }
};

base.func.phoneCaptchaMem = function (phone, memClient, req, res, next) {
  let __ = req.i18n.__.bind(req.i18n);
  if (!memClient || typeof memClient.get !== 'function' || typeof memClient.set !== 'function') {
    return next({type: 'SystemError', err: 'clientError'});
  }
  memClient.get(phone.toString(), function (err, val) {
    if (err) {
      return next({type: 'SystemError', err: err});
    }
    if (val) {
      val = val.toString();
      try {
        val = JSON.parse(val);
      } catch (e) {
        return next({type: 'SystemError', err: 'JSON.parseError'});
      }
      if (new Date().getTime() - val.time < 55000) {
        return res.status(500).send({type: 'message', message: __('api.register.Frequently')});
      }
    }
    let valNew = {
      code: Math.random() * 900000 | 100000,
      time: new Date().getTime()
    };
    memClient.set(phone.toString(), JSON.stringify(valNew), function (errSet) {
      if (errSet) {
        next({type: 'SystemError', err: errSet});
      } else {
        getSettingsByApp('auth').then(settings=> {
          let corporationName = 'UnitedStack 有云';

          settings.some(setting=> {
            return setting.name === 'corporation_name' && (corporationName = setting.value);
          });

          drivers.kiki.sms.sendSms(
            config('phone_area_code') || '86',
            phone.toString(),
            `【${corporationName}】 ${req.i18n.__('api.register.VerificationCode')} ${valNew.code}`,
            req.admin.kikiRemote,
            req.admin.token,
            function (errSend) {
              if (errSend) {
                memClient.set(phone.toString(), JSON.stringify({}), function () {
                  next({type: 'SystemError', err: errSend});
                }, 1);
              } else {
                res.send({type: 'message', message: __('api.register.SendSmsSuccess')});
              }
            }
          );
        }, errSetting=> {
          next({type: 'SystemError', err: errSetting});
        });
      }
    }, smsCodeExpire);
  });
};

base.func.emailTokenMem = function (user, memClient, __, cb) {
  memClient.get(user.userId, (errGet, val)=> {
    if (errGet) {
      return cb({status: 500, type: 'SystemError', err: errGet});
    }
    let valOld = val && val.toString();
    let err;
    try {
      valOld = JSON.parse(valOld);
    } catch (e) {
      err = e;
    }

    if (err) {
      cb({status: 500, type: 'SystemError'});
    } else if (valOld && new Date().getTime() - valOld.time < 60000) {
      cb({status: 400, customRes: true, type: '', message: __('api.register.Frequently')});
    } else {
      let valNew = {
        token: uuid.v4(),
        time: new Date().getTime()
      };

      memClient.set(user.userId, JSON.stringify(valNew), function (errSet) {
        if (errSet) {
          cb({type: 'SystemError', err: errSet});
        } else {
          cb(null, valNew.token);
        }
      }, tokenExpire);
    }
  });
};

base.func.getTemplateObj = function (cb) {
  if (typeof cb === 'function') {
    let sets = {};
    Promise.all([
      getSettingsByApp('global'),
      getSettingsByApp('auth')
    ]).then(settings=>settings.forEach(setting => setting.forEach(s => sets[s.name] = s.value))).then(()=> {
      sets.uskinFile = glob.sync('*.uskin.min.css', {cwd: 'client/dist/uskin'})[0];
      cb(null, sets);
    }).catch(cb);
  }
};


base.middleware.customRes = function (err, req, res, next) {
  let __ = req.i18n.__.bind(req.i18n);
  if (err.customRes === true && err.status) {
    res.status(err.status).send(err);
  } else if (err && err.status) {
    next(err);
  } else {
    next(__('api.register.SystemError'));
  }
};


base.middleware.adminLogin = function (req, res, next) {
  adminLogin(function (err, result) {
    if (err) {
      next(err);
    } else {
      req.admin = {token: result.token, kikiRemote: result.remote.kiki[regionId]};
      next();
    }
  });
};

base.middleware.checkLogin = function (req, res, next) {
  if (!req.session.user) {
    return res.status(403).json({error: 'Permission Denied'});
  } else {
    next();
  }
};


module.exports = base;
