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
  if (!app.get('frontEndFiles')) {
    var files = glob.sync('*', {
      cwd: 'static/dist/'
    });
    var frontEndFiles = {};
    files.forEach(function(file) {
      if (file.match(/main.min.js$/)) {
        frontEndFiles.mainJsFile = file;
      } else if (file.match(/login.min.js$/)) {
        frontEndFiles.loginJsFile = file;
      } else if (file.match(/login.min.css$/)) {
        frontEndFiles.loginCssFile = file;
      } else if (file.match(/main.min.css$/)) {
        frontEndFiles.mainCssFile = file;
      }
    });
    var uskinFile = glob.sync('*.uskin.min.css', {
      cwd: 'static/dist/uskin'
    });
    frontEndFiles.uskinFile = uskinFile[0];
    app.set('frontEndFiles', frontEndFiles);
  }

  function renderStaticTemplate(req, res, next) {
    var locale = req.i18n.getLocale();
    var staticFiles = app.get('frontEndFiles');
    if (req.session && req.session.userId) {
      res.render('index', {
        mainJsFile: staticFiles.mainJsFile,
        mainCssFile: staticFiles.mainCssFile,
        uskinFile: staticFiles.uskinFile
      });
    } else {
      res.render('login', {
        locale: locale,
        unitedstack: req.i18n.__('views.login.unitedstack'),
        login: req.i18n.__('views.login.login'),
        signup: req.i18n.__('views.login.signup'),
        forgotPass: req.i18n.__('views.login.forgotPass'),
        loginJsFile: staticFiles.loginJsFile,
        loginCssFile: staticFiles.loginCssFile,
        uskinFile: staticFiles.uskinFile,
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
