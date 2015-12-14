/**
 * Module dependencies
 */
var config = require('../config'),
  express = require('express'),
  morgan = require('morgan');


var bodyParser = require('body-parser');


/**
 * Returns the server HTTP request handler "app".
 *
 * @api public
 */
function setup() {
  var app = express();
  app.use(require('cookie-parser')('keyboard cat'));
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

  if (config('env') === 'development') {
    // setup logger
    app.use(morgan('dev'));
    // Start up the webpasck dev server.
    //var test = require('bundler');
  } else {
    // setup logger
    app.use(morgan('combined'));
  }


  // var api = require('api');
  // app.use(api());

  var api = require('api');
  api(app);

  var views = require('views');
  views(app);

  var mq = require('mq');
  mq(app);

  return app;
}

/**
 * Module exports
 */
module.exports = setup;