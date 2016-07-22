'use strict';

/**
 * Module dependencies
 */
const config = require('../config'),
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  Logger = require('../middlewares/logger'),
  cookieParser = require('cookie-parser'),
  path = require('path');

let moduleConfig;
try {
  moduleConfig = require('../../../config');
} catch (e) {
  moduleConfig = undefined;
}

/**
 * Returns the server HTTP request handler "app".
 *
 * @api public
 */
function setup() {
  const app = express();
  app.set('query parser', 'simple');
  app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'client')));
  const assetsDir = config('assets_dir') || '/opt/assets';
  app.use(assetsDir, express.static(assetsDir));
  app.use(cookieParser(config('sessionEngine').secret));

  // for nginx
  app.enable('trust proxy');

  // template engine
  app.set('view engine', 'ejs');
  // use Redis | Memcached to store session
  const sessionHandler = require('../middlewares/sessionHandler');
  sessionHandler(app);

  // setup access logger
  const logConfig = config('log');
  if (logConfig.printAccessLog) {
    app.use(morgan(logConfig.format, {
      'stream': Logger.accessLogger
    }));
  }

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  const i18n = require('../middlewares/i18n');
  i18n(app);

  // use third-party authentications
  app.use(require('../plugins'));

  const views = require('views');
  views(app);

  const api = require('api');
  api(app);

  if (moduleConfig) {
    app.get('/version', (req, res, next) => {
      res.render('version', moduleConfig);
    });
  }

  //error handler
  if (logConfig.debug) {
    const devErrorHandler = require('errorhandler');
    app.use(devErrorHandler());
  } else {
    app.use(Logger.errorLogger);
    const errorHandler = require('../middlewares/errorHandler');
    app.use(errorHandler);
  }
  return app;
}

/**
 * Module exports
 */
module.exports = setup;
