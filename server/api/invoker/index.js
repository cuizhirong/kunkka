'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (app) {
  // FIXME add session check
  let apiPath = path.join(__dirname, 'api');
  fs.readdirSync(apiPath)
    .filter(file => file.indexOf('.') !== 0 && file !== 'base.js' && file !== 'lang.json')
    .forEach(file => {
      let ApiModule = require(path.join(apiPath, file));
      let apiModule = new ApiModule(app);
      if (apiModule.initRoutes) {
        apiModule.initRoutes();
      }
    });
};
