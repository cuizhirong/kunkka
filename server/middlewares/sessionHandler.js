var config = require('../config');
var session = require('express-session');

module.exports = function(app) {
  var sessionEngine = config('sessionEngine');
  if (sessionEngine.type === 'Session') {
    app.use(session({
      secret: config('session').secret,
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
};
