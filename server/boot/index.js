/**
 * Module dependencies
 */
var config = require('../config'),
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  Logger = require('../middlewares/logger'),
  cookieParser = require('cookie-parser'),
  path = require('path');


/**
 * Returns the server HTTP request handler "app".
 *
 * @api public
 */
function setup() {
  var app = express();
  app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'static')));
  app.use(cookieParser(config('sessionEngine').secret));
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  // for nginx
  app.enable('trust proxy');

  // template engine
  app.set('view engine', 'ejs');

  // use Redis | Memcache to store session
  var sessionHandler = require('../middlewares/sessionHandler');
  sessionHandler(app);

  // setup access logger
  var logConfig = config('log');
  if (logConfig.printAccessLog) {
    app.use(morgan(logConfig.format, {
      'stream': Logger.accessLogger
    }));
  }

  var i18n = require('../middlewares/i18n');
  i18n(app);

  var api = require('api');
  api(app);

  var views = require('views');
  views(app);

  var mqConfig = config('mq');
  if (mqConfig && mqConfig.enabled) {
    var mq = require('mq');
    mq(app);
  }

  //error handler
  if (logConfig.debug) {
    var devErrorHandler = require('errorhandler');
    app.use(devErrorHandler());
  } else {
    app.use(Logger.errorLogger);
    var errorHandler = require('../middlewares/errorHandler');
    app.use(errorHandler);
  }
  return app;
}

/**
 * Module exports
 */
module.exports = setup;
