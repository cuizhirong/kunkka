'use strict';

const i18n = require('i18n-2');
const path = require('path');
module.exports = function (app) {
  i18n.expressBind(app, {
    locales: ['zh-cn', 'en'],
    cookieName: 'locale',
    directory: path.resolve(__dirname, '../../locale/server'),
    devMode: false
  });

  //FIXME: find out a better way to do this
  global.locales = {
    availableLocales: ['zh-cn', 'en'],
    defaultLocale: 'zh-cn'
  };
  app.use(function(req, res, next) {
    if (req.cookies[req.i18n.cookieName]) {
      req.i18n.setLocaleFromCookie();
    } else {
      req.i18n.setLocale(req.i18n.preferredLocale());
    }
    if (req.query.lang) {
      req.i18n.setLocaleFromQuery(req);
      res.cookie('locale', req.i18n.getLocale());
      return res.redirect('back');
    }
    next();
  });
};
