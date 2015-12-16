/**
 * External dependencies
 */
var express = require('express');
var path = require('path');
var glob = require('glob');
/**
 * Internal dependencies
 */


module.exports = function(app) {
  app.set('views', __dirname);

  app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'static')));
  if (!app.get('frontEndFiles')) {
    var files = glob.sync('*', {
      cwd: 'static/dist/'
    });
    var frontEndFiles = {};
    files.forEach(function (file) {
      if (file.indexOf('.js') > -1) {
        frontEndFiles.jsFile = file;
      } else {
        frontEndFiles.cssFile = file;
      }
    });
    app.set('frontEndFiles', frontEndFiles);
  }

  function renderStaticTemplate(req, res, next) {
    if (req.session && req.session.userId) {
      res.render('index', {
        jsFile: app.get('frontEndFiles').jsFile,
        cssFile: app.get('frontEndFiles').cssFile
      });
    } else {
      res.render('login', {
        jsFile: app.get('frontEndFiles').jsFile,
        cssFile: app.get('frontEndFiles').cssFile
      });
    }
  }

  app.use('/', renderStaticTemplate);
};
