var fs = require('fs');
var Extensions = {};

fs.readdirSync(__dirname)
  .filter(function (file) {
    return file !== 'index.js';
  })
  .forEach(function (extension) {
    Extensions[extension] = require('./' + extension);
  });
module.exports = Extensions;
