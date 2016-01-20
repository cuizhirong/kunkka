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

  function renderStaticTemplate(req, res, next) {
    var locale = upperCaseLocale(req.i18n.getLocale());
    var i18n = req.i18n.__.bind(req.i18n);
    if (req.session && req.session.user) {
      var HALO = {
        configs: {
          lang: locale
        },
        user: req.session.user
      };

      res.render('index', {
        HALO: JSON.stringify(HALO),
        mainJsFile: staticFiles[locale].mainJsFile,
        mainCssFile: staticFiles.mainCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(dashboardModelFactory({
          language: req.i18n.__('shared')
        }))
      });
    } else {
      res.render('login', {
        locale: locale,
        unitedstack: i18n('views.login.unitedstack'),
        login: i18n('views.login.login'),
        signup: i18n('views.login.signup'),
        forgotPass: i18n('views.login.forgotPass'),
        loginJsFile: staticFiles[locale].loginJsFile,
        loginCssFile: staticFiles.loginCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(loginModelFactory({
          accountPlaceholder: i18n('shared.account_placeholder'),
          pwdPlaceholder: i18n('shared.pwd_placeholder'),
          errorTip: i18n('shared.error_tip'),
          submit: i18n('shared.submit')
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
