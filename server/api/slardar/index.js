'use strict';

const fs = require('fs');
const path = require('path');
const extType = require('config')('extension');
const request = require('superagent');

const render = require('../brewmaster/api/base').func.render;
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

  app.get('/proxy/kiki/v1/subscriptions/:id/confirm', function (req, res, next) {
    if (!req.session.user) {
      return render({
        req, res, err: {
          status: 401,
          customRes: true,
          message: req.i18n.__('api.keystone.unauthorized')
        }
      });
    }

    let remote = req.session.endpoint;
    let region = req.headers.region || req.session.user.regionId;
    let service = req.path.split('/')[2];
    let target = remote[service][region] + '/' + req.path.split('/').slice(3).join('/');

    request.post(target)
      .set(req.headers)
      .set('X-Auth-Token', req.session.user.token)
      .send({code: req.query.code})
      .end((err, payload) => {
        if (err) {
          render({
            req, res, err: {
              status: 500,
              customRes: true,
              message: req.i18n.__('api.keystone.confirmError')
            }
          });
        } else {
          render({
            req, res, content: {message: req.i18n.__('api.keystone.confirmSuccess')}
          });
        }
      });
  });
  // check session
  app.use(['/api/v1/', '/proxy/'], function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.keystone.unauthorized')});
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
          return s !== 'lang.json' && s !== '.DS_Store'; // exclude lang.json
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
