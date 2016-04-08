'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const glob = require('glob');
const fs = require('fs');
const loginModel = require('client/applications/login/model.jsx');
const loginModelFactory = React.createFactory(loginModel);
const upperCaseLocale = require('helpers/upper_case_locale');

const tmplString = {};

global.locales.availableLocales.forEach((lang) => {
  let langDetail = JSON.parse(fs.readFileSync('locale/server/' + lang + '.js', 'utf-8'));
  tmplString[lang] = ReactDOMServer.renderToString(loginModelFactory({
    accountPlaceholder: langDetail.shared.account_placeholder,
    pwdPlaceholder: langDetail.shared.pwd_placeholder,
    errorTip: langDetail.shared.error_tip,
    submit: langDetail.shared.submit
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
      modelTmpl: tmplString[req.i18n.locale]
    });
  } else if (req.session && req.session.user){
    res.redirect('/project/');
  }
}

module.exports = (app) => {
  let views = app.get('views');
  views.push(__dirname);
  app.get('/', renderTemplate);
};
