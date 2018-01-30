'use strict';

const fs = require('fs');

module.exports = function (app) {
  app.get('/browser-invalid', (req, res) => {
    res.render('browser.ejs');
  });
  fs.readdirSync(__dirname)
    .filter(c => {
      return c.indexOf('.') === -1;
    })
    .forEach(c => {
      require(__dirname + '/' + c)(app);
    });
  return app;
};
