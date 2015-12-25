/**
 * External dependencies
 */

require('babel-core/register');

var glob = require('glob');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var loginModel = require('../../static/login/model.jsx');

var model = React.createFactory(loginModel);

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
    cwd: 'static/dist/'
  });
  var uskinFile = glob.sync('*.uskin.min.css', {
    cwd: 'static/dist/uskin'
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
    if (req.session && req.session.user) {
      res.render('index', {
        mainJsFile: staticFiles[locale].mainJsFile,
        mainCssFile: staticFiles.mainCssFile,
        uskinFile: uskinFile[0]
      });
    } else {
      res.render('login', {
        locale: locale,
        unitedstack: req.i18n.__('views.login.unitedstack'),
        login: req.i18n.__('views.login.login'),
        signup: req.i18n.__('views.login.signup'),
        forgotPass: req.i18n.__('views.login.forgotPass'),
        loginJsFile: staticFiles[locale].loginJsFile,
        loginCssFile: staticFiles.loginCssFile,
        uskinFile: uskinFile[0],
        ModelTmpl: ReactDOMServer.renderToString(model({
          accountPlaceholder: req.i18n.__('shared.accountPlaceholder'),
          pwdPlaceholder: req.i18n.__('shared.pwdPlaceholder'),
          errorTip: req.i18n.__('shared.errorTip'),
          submit: req.i18n.__('shared.submit')
        }))
      });
    }
  }

  app.get('/', renderStaticTemplate);
};
