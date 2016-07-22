'use strict';

const pluginName = require('../config')('plugin');

if (pluginName) {
  module.exports = function (req, res, next) {
    if (req.session && req.session.user) {
      next();
    } else {
      require('./' + pluginName)(req, res, next);
    }
  };
} else {
  module.exports = function (req, res, next) {
    next();
  };
}
