/**
 * External dependencies
 */
var express = require('express');
var path = require('path');

/**
 * Internal dependencies
 */

module.exports = function(app) {
  app.set('views', __dirname);

  app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'static')));

  function renderStaticTemplate(req, res, next) {
    if (req.session && req.session.token) {
      res.render('index.jade', {
        title: 'Login',
        style: ['/static/uskin/uskin.min.css', '/static/style.css']
      });
    } else {
      res.render('login.jade', {
        title: 'Login',
        style: ['https://dn-ustack.qbox.me/login.css']
      });
    }
  }

  app.use('/', renderStaticTemplate);
};
