'use strict';

require('babel-core/register')({
  ignore: ['node_modules', 'server', 'openstack_server', 'configs']
});
require('../helpers/less_register');

var fs = require('fs');
var glob = require('glob');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

var loginModel = require('client/applications/login/model.jsx');
var dashboardModel = require('client/applications/dashboard/model.jsx');
var adminModel = require('client/admin/model.jsx');

var config = require('config');

var loginModelFactory = React.createFactory(loginModel);
var dashboardModelFactory = React.createFactory(dashboardModel);
var adminModelFactory = React.createFactory(adminModel);

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
  app.set('views', [__dirname + '/dashboard', __dirname + '/login', __dirname + '/admin']);

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
        staticFiles[locale].dashboardJsFile = file;
      } else if (file.indexOf(locale) > -1 && file.match(/login.min.js$/)) {
        staticFiles[locale].loginJsFile = file;
      } else if (file.indexOf(locale) > -1 && file.match(/admin.min.js$/)) {
        staticFiles[locale].adminJsFile = file;
      }
    });
  });
  staticFiles.loginCssFile = files.find(function(el) {
    return el.match(/login.min.css$/) !== null;
  });
  staticFiles.dashboardCssFile = files.find(function(el) {
    return el.match(/dashboard.min.css$/) !== null;
  });
  staticFiles.adminCssFile = files.find(function(el) {
    return el.match(/admin.min.css$/) !== null;
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

  function renderProjectTemplate(req, res, next) {
    var locale = upperCaseLocale(req.i18n.getLocale());
    var __ = req.i18n.__.bind(req.i18n);
    var user,
      username,
      HALO;
    if (req.session && req.session.user) {
      user = req.session.user;
      username = user.username;
      HALO = {
        configs: {
          lang: locale
        },
        user: {
          projectId: user.projectId,
          projects: user.projects,
          userId: user.userId,
          username: username
        },
        region_list: regions[locale],
        current_region: user.regionId ? user.regionId : regions[locale][0].id,
        // FIXME:
        websocket: {
          url: websocketUrl
        }
      };
      if (req.cookies[username]) {
        res.cookie(username, Object.assign(req.cookies[username], {
          region: HALO.current_region
        }));
      }
      res.render('dashboard', {
        HALO: JSON.stringify(HALO),
        mainJsFile: staticFiles[locale].dashboardJsFile,
        mainCssFile: staticFiles.dashboardCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(dashboardModelFactory({
          language: __('shared'),
          HALO: HALO
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

  function renderAdminTemplate (req, res, next) {
    var locale = upperCaseLocale(req.i18n.getLocale());
    var __ = req.i18n.__.bind(req.i18n);
    var user,
      username,
      HALO;
    if (req.session && req.session.user && req.session.user.isAdmin) {
      user = req.session.user;
      username = user.username;
      HALO = {
        configs: {
          lang: locale
        },
        user: {
          projectId: user.projectId,
          projects: user.projects,
          userId: user.userId,
          username: username,
          isAdmin: true
        },
        region_list: regions[locale],
        current_region: user.regionId ? user.regionId : regions[locale][0].id,
        // FIXME:
        websocket: {
          url: websocketUrl
        }
      };
      res.render('admin', {
        HALO: JSON.stringify(HALO),
        mainJsFile: staticFiles[locale].adminJsFile,
        mainCssFile: staticFiles.adminCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(adminModelFactory({
          language: __('shared'),
          username: username
        }))
      });
    } else {
      res.redirect('/');
    }
  }

  app.get('/', renderProjectTemplate);
  app.get(/^\/project\/(.*)/, renderProjectTemplate);
  app.get(/^\/admin\/(.*)/, renderAdminTemplate);
};
