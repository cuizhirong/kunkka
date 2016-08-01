'use strict';

const pluginName = require('../config')('plugin');

if (pluginName) {
  module.exports = require('./' + pluginName);
} else {
  module.exports = function (req, res, next) {
    next();
  };
}
