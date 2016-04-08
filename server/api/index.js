'use strict';

const fs = require('fs');

module.exports = function (app) {
  fs.readdirSync(__dirname)
    .filter(c => {
      return c.indexOf('.') === -1;
    })
    .forEach(c => {
      require(__dirname + '/' + c)(app);
    });
  return app;
};
