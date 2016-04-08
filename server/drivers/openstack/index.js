'use strict';

const fs = require('fs');
const path = require('path');
const extType = require('config')('extension').type;
const extPath = path.join(__dirname, 'extensions', extType);

const driver = {};

/* original driver. */
fs.readdirSync(__dirname).forEach( m => {
  if ( m.indexOf('.') === -1 ) { // cinder ...
    driver[m] = {};
    fs.readdirSync(path.join(__dirname, m)).forEach( s => { // snapshot ...
      if (s !== '.DS_Store') {
        driver[m][s] = require(path.join(__dirname, m, s));
      }
    });
  }
});

/* driver with extensions. */
let extPathList = [];
try {
  extPathList = fs.readdirSync(extPath);
} catch (err) {
  console.log();
}
extPathList.filter( m => { // cinder ...
  return m.indexOf('.') === -1 && m !== 'extensions';
})
.forEach( m => {
  if ( !driver[m] ) {
    driver[m] = {};
  }
  fs.readdirSync(extPath + '/' + m).forEach( s => { // snapshot ...
    if (s !== '.DS_Store') {
      driver[m][s] = require(extPath + '/' + m + '/' + s);
    }
  });
});

module.exports = driver;
