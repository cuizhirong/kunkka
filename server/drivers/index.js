'use strict';

const fs = require('fs');

let driver = {};

fs.readdirSync(__dirname)
  .filter(c => {
    return c.indexOf('.') === -1;
  })
  .forEach(c => {
    let cloud = require(__dirname + '/' + c);
    Object.assign(driver, cloud);
  });

module.exports = driver;
