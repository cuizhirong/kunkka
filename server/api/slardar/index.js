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
        apiExtension[m][path.basename(s, '.js')] = require(extPath + '/' + m + '/' + s);
      }
    });
  });
}


module.exports = function(app) {
  // check session
  app.use(['/api/v1/', '/proxy/'], function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.auth.unauthorized')});
    }
  });
  // load proxy module
  require('./proxy')(app);
  // load api module
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
          let ApiModule = require(path.join(apiPath, m, s));
          /* add extensions */
          s = path.basename(s, '.js');
          let extension = (apiExtension && apiExtension[m] && apiExtension[m][s]) ? apiExtension[m][s] : undefined;
          if (extension) {
            Object.assign(ApiModule.prototype, extension);
          }
          let apiModule = new ApiModule(app);
          if (apiModule.initRoutes) {
            apiModule.initRoutes();
          }
        });
    });
  return app;
};
