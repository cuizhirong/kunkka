require('babel-core/register')({
  ignore: ['node_modules', 'server', 'openstack_server', 'configs']
});
require('../helpers/less_register');

var fs = require('fs');
var glob = require('glob');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

var loginModel = require('client/login/model.jsx');
var dashboardModel = require('client/dashboard/model.jsx');
var config = require('config');

var loginModelFactory = React.createFactory(loginModel);
var dashboardModelFactory = React.createFactory(dashboardModel);

var tmplString = {};
global.locales.availableLocales.forEach(function(lang) {
  var langDetail = JSON.parse(fs.readFileSync('i18n/server/' + lang + '.js', 'utf-8'));
  tmplString[lang] = ReactDOMServer.renderToString(loginModelFactory({
    accountPlaceholder: langDetail.shared.account_placeholder,
    pwdPlaceholder: langDetail.shared.pwd_placeholder,
    errorTip: langDetail.shared.error_tip,
    submit: langDetail.shared.submit
  }));
});

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
      if (file.indexOf(locale) > -1 && file.match(/dashboard.min.js$/)) {
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
    return el.match(/dashboard.min.css$/) !== null;
  });

  var regions = {};
  var languages = Object.keys(config('region')[0].name);
  languages.forEach(function(lang) {
    regions[lang] = [];
    config('region').forEach(function(reg) {
      regions[lang].push({
        name: reg.name[lang],
        id: reg.id
      });
    });
  });

  var websocketUrl = config('websocket').url;

  function renderStaticTemplate(req, res, next) {
    var locale = upperCaseLocale(req.i18n.getLocale());
    var __ = req.i18n.__.bind(req.i18n);
    if (req.session && req.session.user) {
      var username = req.session.user.username;
      var HALO = {
        configs: {
          lang: locale
        },
        user: {
          projectId: req.session.user.projectId,
          userId: req.session.user.userId,
          username: username
        },
        region_list: regions[locale],
        current_region: req.session.user.regionId ? req.session.user.regionId : regions[locale][0].id,
        // FIXME:
        websocket: {
          url: websocketUrl
        }
      };
      res.cookie(username, Object.assign(req.cookies[username], {
        region: HALO.current_region
      }));
      res.render('dashboard', {
        HALO: JSON.stringify(HALO),
        mainJsFile: staticFiles[locale].mainJsFile,
        mainCssFile: staticFiles.mainCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(dashboardModelFactory({
          language: req.i18n.__('shared'),
          username: username
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
        modelTmpl: tmplString[req.i18n.locale]
      });
    }
  }

  app.get('/', renderStaticTemplate);
  app.get(/^\/project\/(.*)/, renderStaticTemplate);
  app.get(/^\/admin\/(.*)/, renderStaticTemplate);
  app.get(/^\/identity\/(.*)/, renderStaticTemplate);
  app.get(/^\/bill\/(.*)/, renderStaticTemplate);
};
