'use strict';

const fs = require('fs');
const path = require('path');
const extType = require('config')('extension').type;

/* get extensions object. */
let apiExtension;

if (extType) {
  let extPath = path.join(__dirname, 'extensions', extType);
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
      if (s !== '.DS_Store') { // in mac env...
        apiExtension[m][s] = require(extPath + '/' + m + '/' + s);
      }
    });
  });
}


module.exports = function(app) {
  let apiPath = path.join(__dirname, 'api');
  fs.readdirSync(apiPath)
    .filter( m => { // cinder ...
      return fs.statSync(path.join(apiPath, m)).isDirectory();
    })
    .forEach( m => {
      fs.readdirSync(path.join(apiPath, m))
        .filter( s => {
          return s !== 'lang.json'; // exclude lang.json
        })
        .forEach( s => {
          let apiModule = require(path.join(apiPath, m, s));
          /* add extensions */
          let extension = (apiExtension && apiExtension[m] && apiExtension[m][s]) ? apiExtension[m][s] : undefined;
          apiModule(app, extension);
        });
    });
  return app;
};
