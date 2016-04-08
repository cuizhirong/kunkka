'use strict';

const fs = require('fs');
const path = require('path');
const extType = require('config')('extension').type;
const extPath = path.join(__dirname, 'extensions', extType);

/* get extensions object. */
let apiExtension;
let extPathList = [];
try {
  extPathList = fs.readdirSync(extPath);
} catch (err) {
  console.log();
}
extPathList.filter( m => { // cinder ...
  return m.indexOf('.') === -1;
})
.forEach( m => {
  if ( !apiExtension ) {
    apiExtension = {};
  }
  apiExtension[m] = {};
  fs.readdirSync(extPath + '/' + m).forEach( s => { // snapshot ...
    if (s !== '.DS_Store') {
      apiExtension[m][s] = require(extPath + '/' + m + '/' + s);
    }
  });
});

module.exports = function(app) {
  fs.readdirSync(__dirname)
    .filter( m => { // cinder ...
      return m.indexOf('.') === -1 && m !== 'extensions';
    })
    .forEach( m => {
      fs.readdirSync(path.join(__dirname, m))
        .filter( s => {
          return s.indexOf('.') === -1; // snapshot ...
        })
        .forEach( s => {
          let apiModule = require(path.join(__dirname, m, s));
          /* add extensions */
          let extension = (apiExtension && apiExtension[m] && apiExtension[m][s]) ? apiExtension[m][s] : undefined;
          apiModule(app, extension);
        });
    });
  return app;
};
