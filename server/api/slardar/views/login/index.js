'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const glob = require('glob');
const fs = require('fs');
const loginModel = require('client/applications/login/model.jsx');
const loginModelFactory = React.createFactory(loginModel);
const upperCaseLocale = require('helpers/upper_case_locale');
const tusk = require('api/tusk/driver');

const tmplString = {};

global.locales.availableLocales.forEach((lang) => {
  let langDetail = {};
  try {
    langDetail = JSON.parse(fs.readFileSync('locale/server/' + lang + '.js', 'utf-8')).shared.login;
  } catch (e) {
    console.log(`${lang} has no login locale file`);
  }
  let loginLang = {};
  ['account_placeholder', 'pwd_placeholder', 'error_tip', 'submit'].forEach((m) => {
    loginLang[m] = langDetail[m];
  });
  tmplString[lang] = ReactDOMServer.renderToString(loginModelFactory({
    __: loginLang
  }));
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
  let regex = new RegExp(locale + '.login.min.js$');
  files.some((file) => {
    return file.match(regex) && (staticFiles[locale].loginJsFile = file);
  });
});
staticFiles.loginCssFile = files.find((el) => {
  return el.match(/login.min.css$/) !== null;
});

function renderTemplate (req, res, next) {

  tusk.getSettingsByApp('login', function (err, loginSettings) {
    let setting = {};
    if (!err) {
      loginSettings.forEach( s => {
        setting[s.name] = s.value;
      });
    }
    let favicon = setting.favicon ? setting.favicon : '/static/assets/favicon.ico';
    let logo = setting.logo ? setting.logo : '/static/assets/logo@2x.png';
    let company = setting.company ? setting.company : '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号';
    let title = setting.title ? setting.title : 'UnitedStack';
    if (!req.session || !req.session.user) {
      let locale = upperCaseLocale(req.i18n.getLocale());
      let __ = req.i18n.__.bind(req.i18n);
      res.render('login', {
        locale: locale,
        unitedstack: __('views.login.unitedstack'),
        login: __('views.login.login'),
        signup: __('views.login.signup'),
        forgotPass: __('views.login.forgotPass'),
        loginJsFile: staticFiles[locale].loginJsFile,
        loginCssFile: staticFiles.loginCssFile,
        uskinFile: uskinFile[0],
        settings: setting,
        logo: logo,
        favicon: favicon,
        company: company,
        title: title,
        modelTmpl: tmplString[req.i18n.locale]
      });
    } else if (req.session && req.session.user){
      res.redirect('/dashboard/');
    }
  }, false);
}

module.exports = (app) => {
  let views = app.get('views');
  views.push(__dirname);
  app.get('/', renderTemplate);
};
