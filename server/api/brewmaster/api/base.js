'use strict';
const config = require('config');
const region = config('region');
const Promise = require('bluebird');
const co = require('co');
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
const getUserAsync = drivers.keystone.user.getUserAsync;
const listUsersAsync = drivers.keystone.user.listUsersAsync;

const uskinFile = glob.sync('*.uskin.min.css', {cwd: 'client/dist/uskin'})[0];

const base = {func: {}, middleware: {}};

base.func.verifyUser = function (adminToken, where, cb) {
  if (cb && typeof cb === 'function') {
    let user;
    userModel.findOne({where: where}).then(userDB => {
      user = userDB;
      if (!userDB) {
        return Promise.reject('userNotExist');
      } else {
        return getUser(adminToken, keystoneRemote, userDB.id).then((userKeystone) => {
          cb(null, true, userKeystone.body.user);
        });
      }
    }).catch(err => {
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
    listUsers(adminToken, keystoneRemote, (err, result) => {
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
        getSettingsByApp('auth').then(settings => {
          let corporationName = 'UnitedStack 有云';

          settings.some(setting => {
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
        }, errSetting => {
          next({type: 'SystemError', err: errSetting});
        });
      }
    }, smsCodeExpire);
  });
};

base.func.emailTokenMem = function (user, memClient, __, cb) {
  memClient.get(user.id, (errGet, val) => {
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

      memClient.set(user.id, JSON.stringify(valNew), function (errSet) {
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
    ]).then(settings => settings.forEach(setting => setting.forEach(s => sets[s.name] = s.value))).then(() => {
      sets.uskinFile = uskinFile;
      cb(null, sets);
    }).catch(cb);
  }
};

base.func.render = function (opt) {
  if (opt.err && opt.err.customRes) {
    opt.content = {
      message: opt.err.message,
      subtitle: ''
    };
  }
  base.func.getTemplateObjAsync().then(obj => {
    Object.assign(
      obj,
      {subtitle: '', message: opt.req.i18n.__('api.register.SystemError')},
      opt.content
    );

    obj.locale = opt.req.i18n.locale;
    opt.res.status(opt.code || 200).render(opt.view || 'single', obj);
  }).catch(() => {
    const obj = {
      single_logo_url: '/static/assets/nav_logo.png',
      favicon: '/static/login/favicon.ico',
      title: 'UnitedStack 有云',
      default_image_url: '',
      company: '©2016 UnitedStack Inc. All Rights Reserved. ?ICP?13015821?',
      corporation_name: 'UnitedStack 有云'
    };

    obj.subtitle = obj.message = opt.req.i18n.__('api.register.SystemError');
    obj.locale = opt.req.i18n.locale;
    opt.res.render('single', obj);
  });
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
  if (!req.session || !req.session.user) {
    res.status(403).json({error: 'Permission Denied'});
  } else {
    next();
  }
};

/*** Promise ***/
base.func.verifyByNameAsync = function (adminToken, name) {
  return co(function*() {
    const result = yield listUsersAsync(adminToken, keystoneRemote, {name: name});
    const users = result.body.users;
    if (Array.isArray(users) && users.length) {
      return {
        exist: true,
        user: users[0]
      };
    } else {
      yield userModel.destroy({where: {name: name}});
      return {exist: false};
    }
  });
};

base.func.verifyUserAsync = function (adminToken, where) {

  return co(function *() {
    const userDB = yield userModel.findOne({where: where});
    if (!userDB) {
      return {
        exist: false
      };
    }
    const userKeystone = yield getUserAsync(adminToken, keystoneRemote, userDB.id);
    return {
      exist: true,
      user: userKeystone.body.user
    };
  }).catch(e => {
    if (e.status === 404) {
      return userModel.destroy({where: where}).then(() => {
        return {
          exist: false
        };
      });
    } else {
      return Promise.reject(e);
    }
  });
};


base.func.getTemplateObjAsync = function () {
  return co(function *() {
    let settings = yield [
      getSettingsByApp('global'),
      getSettingsByApp('auth')
    ];
    let sets = {};
    settings.forEach(setting => setting.forEach(s => sets[s.name] = s.value));
    sets.uskinFile = uskinFile;
    return sets;
  });
};

base.func.emailTokenMemAsync = function (user, memClient, __) {
  return co(function*() {
    let val = yield memClient.getAsync(user.id);
    let valOld = val[0] && val[0].toString();
    try {
      valOld = JSON.parse(valOld);
    } catch (e) {
      valOld = false;
    }

    if (valOld && new Date().getTime() - valOld.time < 60000) {
      return Promise.reject({status: 400, customRes: true, type: '', message: __('api.register.Frequently')});
    } else {
      let valNew = {
        token: uuid.v4(),
        time: new Date().getTime()
      };
      yield memClient.setAsync(user.id, JSON.stringify(valNew), tokenExpire);
      return valNew.token;
    }
  });
};


base.func.checkUserEnabled = function (adminToken, where) {
  return co(function *() {
    const result = yield base.func.verifyUserAsync(adminToken, where);
    const user = result.user;
    if (!result.exist) {
      return Promise.reject({code: 404, message: 'UserNotExist'});
    } else if (user) {
      return !!user.enabled;
    } else {
      return Promise.reject({code: 500, message: 'SystemError'});
    }
  });
};

//检查token、验证码 是否频繁发送
base.func.checkFrequentlyAsync = function (key, memClient) {
  return co(function *() {
    let valOld = yield memClient.getAsync(key);
    valOld = valOld[0] && valOld[0].toString();
    try {
      valOld = JSON.parse(valOld);
    } catch (e) {
      valOld = false;
    }
    return valOld && (new Date().getTime() - valOld.time < 60000);
  });
};

//检查token、验证码是否正确
base.func.verifyEmailTokenAsync = function (userId, token, memClient) {
  return co(function *() {
    let memToken = yield memClient.getAsync(userId);
    memToken = memToken[0] && memToken[0].toString();
    memToken = JSON.parse(memToken);
    memToken = memToken && memToken.token;
    return memToken === token;
  });
};
base.func.verifySmsCodeAsync = function (phone, code, memClient) {
  return co(function *() {
    let memCode = yield memClient.getAsync(phone);
    memCode = memCode[0] && memCode[0].toString();
    memCode = JSON.parse(memCode);
    memCode = memCode && memCode.code;
    return memCode === code;
  });
};

base.func.verifyKeyValueAsync = (key, value, memClient) => {
  return co(function *() {
    let memValue = yield memClient.getAsync(key);
    memValue = memValue[0] && memValue[0].toString();
    memValue = JSON.parse(memValue);
    memValue = memValue && memValue.value;
    return memValue === value;
  });
};

module.exports = base;
