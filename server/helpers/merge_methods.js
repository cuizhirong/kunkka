'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (obj, dirname) {
  fs.readdirSync(dirname)
    .filter(function (file) {
      return file !== 'index.js';
    })
    .forEach(function (file) {
      Object.assign(obj, require(path.join(dirname, file)));
    });
  return obj;
};
