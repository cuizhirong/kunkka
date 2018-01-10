'use strict';

const co = require('co');
const adminLoginFunc = require('api/slardar/common/adminLogin');
const func = require('./func');
const basic = require('./basic');
const uuid = require('node-uuid');

const customResApi = function (err, req, res, next) {
  let __ = req.i18n.__.bind(req.i18n);
  if (err.customRes === true) {
    err.message = __('api.register.' + err.msg);
    res.status(err.status || 500).send(err);
  } else if (err && err.status) {
    next(err);
  } else {
    next(__('api.register.SystemError'));
  }
};

const customResPage = function (err, req, res, next) {
  const __ = req.i18n.__.bind(req.i18n);
  co(function* () {
    if (err.customRes && err.msg) {
      err.message = __('api.register.' + err.msg || err.message);
    }
    const obj = yield func.getTemplateObjAsync();
    let dataId = req.session.dataId = uuid();
    Object.assign(
      obj,
      {dataId},
      {subtitle: '', message: err.message || __('api.register.SystemError'), locale: req.i18n.locale},
      err.data
    );
    res.status(err.code || 200).render(err.view || 'single', obj);
  }).catch(() => {
    const obj = {
      single_logo_url: '/static/assets/nav_logo.png',
      favicon: '/static/login/favicon.ico',
      title: 'UnitedStack 有云',
      default_image_url: '',
      company: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      corporation_name: 'UnitedStack 有云',
      subtitle: '',
      message: __('api.register.SystemError'),
      locale: req.i18n.locale,
      uskinFile: basic.uskinFile
    };
    res.render('single', obj);
  });
};

const adminLogin = function (req, res, next) {
  adminLoginFunc(function (err, result) {
    if (err) {
      next(err);
    } else {
      req.admin = {token: result.token};
      next();
    }
  });
};

const checkLogin = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.status(403).json({error: 'Permission Denied'});
  } else {
    next();
  }
};

const checkEnableRegister = (req, res, next) => {
  co(function* () {
    let settings = yield basic._getSettingsByApp('global');
    let enableRegister, enableRegisterApprove = false;
    let flag = 0;
    settings.some(setting => {
      if (setting.name === 'enable_register') {
        enableRegister = setting.value;
        flag++;
      } else if (setting.name === 'enable_register_approve') {
        enableRegisterApprove = setting.value;
        flag++;
      }
      return flag === 2;
    });
    if (enableRegister) {
      req.enableRegisterApprove = enableRegisterApprove;
      next();
    } else {
      next({
        customRes: true,
        msg: 'registerIsProhibited'
      });
    }
  }).catch(next);
};
const checkAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({error: req.i18n.__('api.keystone.unauthorized')});
  }
  if (req.session.user.isAdmin) {
    next();
  } else {
    res.status(403);
    res.send({message: req.i18n.__('api.register.adminAccessNeeded')});
  }
};
module.exports = {
  checkAdmin,
  checkEnableRegister,
  checkLogin,
  adminLogin,
  customResApi,
  customResPage
};
