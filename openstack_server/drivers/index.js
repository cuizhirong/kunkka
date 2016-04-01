'use strict';

const fs = require('fs');
// const path = require('path');
const config = require('config');
const driverExtension = require('extensions/' + config('extension').type + '/server/drivers');

const driver = {};

// original driver.
fs.readdirSync(__dirname).forEach(function (f) {
  if ( fs.statSync(__dirname + '/' + f).isDirectory() ) {
    driver[f] = {};
    fs.readdirSync(__dirname + '/' + f).forEach(function (file) {
      if (file !== '.DS_Store') {
        driver[f][file] = require('./' + f + '/' + file);
      }
    });
  }
});

// driver with extensions.
Object.keys(driverExtension).forEach(function (s) {
  if (driver[s]) {
    Object.keys(driverExtension[s]).forEach(function (b) {
      if (driver[s][b]) {
        Object.assign(driver[s][b], driverExtension[s][b]);
      } else {
        driver[s][b] = driverExtension[s][b];
      }
    });
  } else {
    driver[s] = driverExtension[s];
  }
});

module.exports = driver;
