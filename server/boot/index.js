/**
 * Module dependencies
 */
var path = require('path'),
    config = require('config'),
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

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    // for nginx
    app.enable('trust proxy');

    // template engine
    app.set('view engine', 'jade');

    var sessionEngine = config('sessionEngine');
    if (sessionEngine.type == 'Session') {
        var session = require('express-session');
        app.use(session({
            secret: 'keyboard cat',
            cookie: {
                maxAge: 6000000
            },
            resave: false,
            saveUninitialized: true
        }));
    }

    if ('development' === config('env')) {
        // setup logger
        app.use(morgan('dev'));
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