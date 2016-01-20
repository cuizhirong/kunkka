/**
 * External dependencies
 */

require('babel-core/register');
require('../helpers/less_register');

var glob = require('glob');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

var loginModel = require('client/login/model.jsx');
var dashboardModel = require('client/dashboard/model.jsx');
var config = require('config');

var loginModelFactory = React.createFactory(loginModel);
var dashboardModelFactory = React.createFactory(dashboardModel);

module.exports = function(app) {
  app.set('views', [__dirname + '/dashboard', __dirname + '/login']);

  function upperCaseLocale(locale) {
    if (locale.indexOf('-') > -1) {
      var parts = locale.split('-');
      return parts[0] + '-' + parts[1].toUpperCase();
    } else {
      return locale;
    }
  }

  var files = glob.sync('*', {
    cwd: 'client/dist/'
  });
  var uskinFile = glob.sync('*.uskin.min.css', {
    cwd: 'client/dist/uskin'
  });
  var locales = JSON.parse(JSON.stringify(global.locales.availableLocales));
  var staticFiles = {};
  locales = locales.map(upperCaseLocale);
  locales.forEach(function(locale) {
    staticFiles[locale] = {};
    files.forEach(function(file) {
      if (file.indexOf(locale) > -1 && file.match(/main.min.js$/)) {
        staticFiles[locale].mainJsFile = file;
      } else if (file.indexOf(locale) > -1 && file.match(/login.min.js$/)) {
        staticFiles[locale].loginJsFile = file;
      }
    });
  });
  staticFiles.loginCssFile = files.find(function(el) {
    return el.match(/login.min.css$/) !== null;
  });
  staticFiles.mainCssFile = files.find(function(el) {
    return el.match(/main.min.css$/) !== null;
  });

  var regions = {};
  var languages = Object.keys(config('region')[0].name);
  languages.forEach(function (lang) {
    regions[lang] = [];
    config('region').forEach(function (reg) {
      regions[lang].push({
        name: reg.name[lang],
        id: reg.id
      });
    });
  });


  function renderStaticTemplate(req, res, next) {
    var locale = upperCaseLocale(req.i18n.getLocale());
    var __ = req.i18n.__.bind(req.i18n);
    if (req.session && req.session.user) {
      var HALO = {
        configs: {
          lang: locale
        },
        user: req.session.user,
        region_list: regions[locale],
        current_region: req.session.region ? req.session.region : regions[locale][0].id
      };

      res.render('index', {
        HALO: JSON.stringify(HALO),
        mainJsFile: staticFiles[locale].mainJsFile,
        mainCssFile: staticFiles.mainCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(dashboardModelFactory({
          language: __('shared')
        }))
      });
    } else {
      res.render('login', {
        locale: locale,
        unitedstack: __('views.login.unitedstack'),
        login: __('views.login.login'),
        signup: __('views.login.signup'),
        forgotPass: __('views.login.forgotPass'),
        loginJsFile: staticFiles[locale].loginJsFile,
        loginCssFile: staticFiles.loginCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(loginModelFactory({
          accountPlaceholder: __('shared.account_placeholder'),
          pwdPlaceholder: __('shared.pwd_placeholder'),
          errorTip: __('shared.error_tip'),
          submit: __('shared.submit')
        }))
      });
    }
  }

  app.get('/', renderStaticTemplate);
  app.get(/^\/project\/(.*)/, renderStaticTemplate);
  app.get(/^\/admin\/(.*)/, renderStaticTemplate);
  app.get(/^\/identity\/(.*)/, renderStaticTemplate);
  app.get(/^\/bill\/(.*)/, renderStaticTemplate);
};
