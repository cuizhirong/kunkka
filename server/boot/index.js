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
  app.set('view engine', 'jade');

  var session = require('express-session');
  var sessionEngine = config('sessionEngine');
  if (sessionEngine.type === 'Session') {
    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true
    }));
  } else if (sessionEngine.type === 'Redis') {
    var RedisStore = require('connect-redis')(session);
    var Redis = require('redis');
    var RedisClient = Redis.createClient({
      host: sessionEngine.host,
      port: sessionEngine.port
    });
    app.set('CacheClient', RedisClient);
    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      store: new RedisStore({
        client: RedisClient
      })
    }));
  }

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

  return app;
}

/**
 * Module exports
 */
module.exports = setup;
