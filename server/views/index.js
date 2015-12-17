/**
 * External dependencies
 */
var glob = require('glob');


module.exports = function(app) {
  app.set('views', [__dirname + '/dashboard', __dirname + '/login']);
  if (!app.get('frontEndFiles')) {
    var files = glob.sync('*', {
      cwd: 'static/dist/'
    });
    var frontEndFiles = {};
    files.forEach(function (file) {
      if (file.match(/main.min.js$/)) {
        frontEndFiles.mainJsFile = file;
      } else if (file.match(/login.min.js$/)) {
        frontEndFiles.loginJsFile = file;
      } else if (file.match(/login.min.css$/)) {
        frontEndFiles.loginCssFile = file;
      } else if (file.match(/uskin.min.css$/)) {
        frontEndFiles.uskinFile = file;
      } else if (file.match(/main.min.css$/)) {
        frontEndFiles.mainCssFile = file;
      }
    });
    app.set('frontEndFiles', frontEndFiles);
  }

  function renderStaticTemplate(req, res, next) {
    var staticFiles = app.get('frontEndFiles');
    if (req.session && req.session.userId) {
      res.render('index', {
        mainJsFile: staticFiles.mainJsFile,
        mainCssFile: staticFiles.mainCssFile,
        uskinFile: staticFiles.uskinFile
      });
    } else {
      res.render('login', {
        loginJsFile: staticFiles.loginJsFile,
        loginCssFile: staticFiles.loginCssFile,
        uskinFile: staticFiles.uskinFile
      });
    }
  }

  app.use('/', renderStaticTemplate);
};
