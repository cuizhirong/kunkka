'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const glob = require('glob');
const dashboardModel = require('client/applications/dashboard/model.jsx');
const dashboardModelFactory = React.createFactory(dashboardModel);
const upperCaseLocale = require('helpers/upper_case_locale');
const config = require('config');
const tusk = require('api/tusk/driver');

const websocketUrl = config('websocket').url;
const regions = {};
const languages = Object.keys(config('region')[0].name);
languages.forEach((lang) => {
  regions[lang] = [];
  config('region').forEach((reg) => {
    regions[lang].push({
      name: reg.name[lang],
      id: reg.id
    });
  });
});

const files = glob.sync('*', {
  cwd: 'client/dist/'
});
const uskinFile = glob.sync('*.uskin.min.css', {
  cwd: 'client/dist/uskin'
});
const locales = JSON.parse(JSON.stringify(global.locales.availableLocales)).map(upperCaseLocale);
const staticFiles = {};
locales.forEach((locale) => {
  staticFiles[locale] = {};
  let regex = new RegExp(locale + '.dashboard.min.js$');
  files.some((file) => {
    return file.match(regex) && (staticFiles[locale].dashboardJsFile = file);
  });
});
staticFiles.dashboardCssFile = files.find((el) => {
  return el.match(/dashboard.min.css$/) !== null;
});

let applications;

function renderProjectTemplate (req, res, next) {
  tusk.getSettingsByApp('dashboard', function (err, dashboardSettings) {
    let setting = {};
    dashboardSettings.forEach( s => {
      setting[s.name] = s.value;
    });
    if (req.session && req.session.user) {
      let locale = upperCaseLocale(req.i18n.getLocale());
      let __ = req.i18n.__.bind(req.i18n);
      let user = req.session.user;
      let username = user.username;
      let applicationList = applications.filter(a => {
        return user.isAdmin ? (a !== 'login') : (a !== 'login' && a !== 'admin');
      }).sort((a, b) => {
        if (a === 'dashboard') {
          return -1;
        } else if (b === 'dashboard') {
          return 1;
        } else {
          return 0;
        }
      }).map(_app => {
        return {[_app]: __(`shared.${_app}.application_name`)};
      });
      let _application = {
        application_list: applicationList,
        current_application: 'dashboard'
      };
      let HALO = {
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
        },
        application: _application,
        settings: setting
      };
      res.render('dashboard', {
        HALO: JSON.stringify(HALO),
        mainJsFile: staticFiles[locale].dashboardJsFile,
        mainCssFile: staticFiles.dashboardCssFile,
        uskinFile: uskinFile[0],
        modelTmpl: ReactDOMServer.renderToString(dashboardModelFactory({
          __: __('shared.dashboard'),
          HALO: HALO
        }))
      });
    } else {
      res.redirect('/');
    }
  }, false);
}

module.exports = (app) => {
  let views = app.get('views');
  views.push(__dirname);
  applications = app.get('applications');
  app.get(/(^\/dashboard$)|(^\/dashboard\/(.*))/, renderProjectTemplate);
  app.get(/^\/dashboard($|\/(.*))/, renderProjectTemplate);
};
