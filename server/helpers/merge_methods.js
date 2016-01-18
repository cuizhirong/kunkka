var extend = require('extend');
var fs = require('fs');
var path = require('path');

module.exports = function (obj, dirname) {
  fs.readdirSync(dirname)
    .filter(function (file) {
      return file !== 'index.js';
    })
    .forEach(function (file) {
      extend(obj, require(path.join(dirname, file)));
    });
  return obj;
};
