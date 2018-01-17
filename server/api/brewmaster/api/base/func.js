'use strict';
const uuid = require('uuid');

const drivers = require('drivers');
const userModel = require('../../models').user;

const config = require('config');
const keystoneRemote = config('keystone');
const TOKEN_EXPIRE = config('reg_token_expire') || 60 * 60 * 24;
const SMS_CODE_EXPIRE = config('reg_sms_expire') || 60 * 10;

const getUserAsync = drivers.keystone.user.getUserAsync;
const listUsersAsync = drivers.keystone.user.listUsersAsync;

const passwordModel = require('../../models').user_password;
const basic = require('./basic');
const crypto = require('./crypto');
const mem = require('./mem');


const checkFrequentlyAsync = function* (key, memClient) {
  let valOld = yield memClient.getAsync(key);
  valOld = valOld[0] && valOld[0].toString();
  if (!valOld) {
    return false;
  } else {
    valOld = JSON.parse(valOld);
    return new Date().getTime() - valOld.createdAt < 55000;
  }
};

const phoneCaptchaMemAsync = function* (opts) {
  const {__, phone, memClient, usage = ''} = opts;
  let isFrequently = yield checkFrequentlyAsync(phone.toString(), memClient);
  if (isFrequently) {
    return {customRes: true, msg: 'Frequently', status: 400};
  }
  let code = Math.random() * 900000 | 100000;
  yield mem.setKeyValueAsync({
    key: phone.toString(),
    value: code,
    memClient,
    expire: SMS_CODE_EXPIRE
  });
  let corporationName = 'UnitedStack 有云';
  let settings = yield basic._getSettingsByApp('auth');
  settings.some(setting => {
    return setting.name === 'corporation_name' && (corporationName = setting.value);
  });

  let smsContent = `【${corporationName}】${usage && __('api.register.' + usage)}${__('api.register.VerificationCode')} ${code}`;
  let result = yield drivers.sms.smsAsync(phone.toString(), smsContent);

  if (result.text === '00') {
    return {customRes: true, msg: 'SendSmsSuccess', status: 200};
  } else {
    return {customRes: true, msg: 'smsSendError', status: 500};
  }
};

const verifyUserByNameAsync = function* (adminToken, name) {
  const result = yield listUsersAsync(adminToken, keystoneRemote, {name});
  const users = result.body.users;
  if (Array.isArray(users) && users.length) {
    return users[0];
  } else {
    yield userModel.destroy({where: {name}});
    return false;
  }
};

const verifyUserByIdAsync = function* (adminToken, userId) {
  let user;
  let userDB = yield userModel.findOne({where: {id: userId}});
  try {
    let result = yield getUserAsync(adminToken, keystoneRemote, userId);
    user = result.body.user;
  } catch (e) {
    if (e.statusCode === 404) {
      yield userModel.destroy({where: {id: userId}, force: true});
      return false;
    } else {
      return Promise.reject(e);
    }
  }
  if (!userDB) {
    userModel.create(user);
  } else {
    Object.assign(user, JSON.parse(JSON.stringify(userDB)));
  }
  return user;
};

const emailTokenMemAsync = function* (user, memClient) {
  let isFrequently = yield checkFrequentlyAsync(user.id, memClient);
  if (isFrequently) {
    return Promise.reject({status: 400, customRes: true, msg: 'Frequently'});
  } else {
    let value = uuid.v4();
    yield mem.setKeyValueAsync({key: user.id, value, expire: TOKEN_EXPIRE, memClient});
    return value;
  }
};

const verifyUserAsync = function* (adminToken, where) {
  const userDB = yield userModel.findOne({where});
  if (!userDB) {
    return false;
  }
  let user;
  try {
    const userKeystoneRes = yield getUserAsync(adminToken, keystoneRemote, userDB.id);
    user = userKeystoneRes.body.user;
  } catch (e) {
    if (e.status === 404) {
      yield userModel.destroy({where, force: true});
      return false;
    } else {
      return Promise.reject(e);
    }
  }
  user.email = userDB.email;
  user.phone = userDB.phone;
  user.status = userDB.status;
  return user;
};

const getTemplateObjAsync = function* () {
  let settings = yield [
    basic._getSettingsByApp('global'),
    basic._getSettingsByApp('auth')
  ];
  let sets = {};
  settings.forEach(setting => setting.forEach(s => sets[s.name] = s.value));
  sets.uskinFile = basic.uskinFile;
  return sets;
};

const checkPasswordAvailable = function* (userId, reqPass) {
  const passwords = yield passwordModel.findAll({
    where: {userId},
    order: [['createdAt', 'DESC']],
    limit: 3
  });
  let isAvailable = true;

  for (let i = 0; i < passwords.length; i++) {
    let compare = yield crypto.compare(reqPass, passwords[i].password);
    if (compare) {
      isAvailable = false;
      break;
    }
  }
  return isAvailable;
};
module.exports = {
  verifyUserByNameAsync,
  verifyUserByIdAsync,
  verifyUserAsync,

  phoneCaptchaMemAsync,
  emailTokenMemAsync,

  checkFrequentlyAsync,
  checkPasswordAvailable,
  getTemplateObjAsync
};
