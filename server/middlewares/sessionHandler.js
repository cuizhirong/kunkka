'use strict';

const config = require('../config');
const session = require('express-session');
const logger = require('./logger').logger;

const promisifyMemcachedClientAPI = function (memcachedClient) {
  //todo:batch defining async function
  memcachedClient.setAsync = function (key, value, expires) {
    return new Promise(function (resolve, reject) {
      memcachedClient.set(key, value, {expires}, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(Array.prototype.slice.call(arguments, 1));
        }
      });
    });
  };

  memcachedClient.getAsync = function (key) {
    return new Promise(function (resolve, reject) {
      memcachedClient.get(key, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(Array.prototype.slice.call(arguments, 1));
        }
      });
    });
  };
  memcachedClient.deleteAsync = function (key) {
    return new Promise(function (resolve, reject) {
      memcachedClient.delete(key, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(Array.prototype.slice.call(arguments, 1));
        }
      });
    });
  };
};

module.exports = function (app) {
  let sessionEngine = config('sessionEngine');
  if (sessionEngine.type === 'Session') {
    app.use(session({
      secret: sessionEngine.secret,
      resave: false,
      saveUninitialized: true
    }));
  } else if (sessionEngine.type === 'Redis') {
    let RedisStore = require('connect-redis')(session);
    let Redis = require('redis');
    let RedisClient = Redis.createClient({
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
    let Memcached = require('memjs');
    let memjsLogger = {};
    memjsLogger.log = logger.error;
    let memcachedClient = Memcached.Client.create(sessionEngine.remotes.join(','), {
      failover: false,
      logger: memjsLogger
    });
    promisifyMemcachedClientAPI(memcachedClient);
    app.set('CacheClient', memcachedClient);
    let MemcachedStore = require('connect-memjs')(session);
    app.use(session({
      secret: sessionEngine.secret,
      resave: false,
      saveUninitialized: true,
      store: new MemcachedStore({
        client: memcachedClient
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
