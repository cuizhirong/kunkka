'use strict';

/**
 * Module dependencies
 */

var env = process.env.NODE_ENV || 'development';

var configObj;
try {
  configObj = require('configs/server');
} catch (e) {
  console.log(e);
  console.error('The format of configuration.js is not correct!!!');
  configObj = {};
}

if (typeof configObj.env === 'undefined') {
  configObj.env = env;
}

function config(field) {
  return configObj[field];
}

module.exports = config;
