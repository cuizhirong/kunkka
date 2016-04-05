'use strict';

var config = require('../config');
var session = require('express-session');
var logger = require('./logger').logger;

module.exports = function(app) {
  var sessionEngine = config('sessionEngine');
  if (sessionEngine.type === 'Session') {
    app.use(session({
      secret: sessionEngine.secret,
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
    RedisClient.on('error', function (err) {
      logger.error(err);
    });
    app.set('CacheClient', RedisClient);
    app.use(session({
      secret: sessionEngine.secret,
      resave: false,
      saveUninitialized: true,
      store: new RedisStore({
        client: RedisClient
      })
    }));
    // handle lost connection to Redis
    app.use(function (req, res, next) {
      if (!req.session) {
        next(new Error('Redis ' + req.i18n.__('shared.out_of_service')));
      } else {
        next();
      }
    });
  } else if (sessionEngine.type === 'Memcached') {
    // var Memcached = require('memjs');
    // var MemcachedClient = Memcached.Client.create(sessionEngine.remotes.join(','), {
    //   failover: true
    // });
    var MemcachedStore = require('connect-memjs')(session);
    app.use(session({
      secret: sessionEngine.secret,
      resave: false,
      saveUninitialized: true,
      store: new MemcachedStore({
        servers: sessionEngine.remotes,
        failover: true
      })
    }));
    // handle lost connection to Memcached
    app.use(function (req, res, next) {
      if (!req.session) {
        next(new Error('Memcached ' + req.i18n.__('shared.out_of_service')));
      } else {
        next();
      }
    });
  }
};
