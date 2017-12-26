'use strict';

/**
 * Module dependencies
 */

let env = process.env.NODE_ENV || 'development';

let configObj, telemetryConfig;
try {
  configObj = require('configs/server');
} catch (e) {
  console.log(e);
  console.error('The format of configuration.js is not correct!!!');
  configObj = {};
}

try {
  // telemetry config file in kunkka/configs/telemetry.json
  telemetryConfig = require('configs/telemetry');
} catch (e) {
  telemetryConfig = {
    'hour': '60',
    'day': '300',
    'week': '600',
    'month': '3600',
    'year': '10800'
  };
}
configObj.telemetry = telemetryConfig;

if (typeof configObj.env === 'undefined') {
  configObj.env = env;
}

function config(field) {
  return configObj[field];
}

module.exports = config;
