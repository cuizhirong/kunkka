var config = {
  'sessionEngine': {
    'type': 'Memcached',                               // 'Redis' | 'Memcached' | 'Session' (do not use it in production)
    'remotes': ['42.62.101.6:11211'],
    'secret': 'keyboard cat',
    'cookie_name': 'ustack'
  },
  'log': {
    'accessLogPath': '/var/log/halo/access.log',
    'errorLogPath': '/var/log/halo/error.log',
    'debug': false,                                // true | false
    'format': 'combined',                    // 'combined' | 'common' | 'dev' | 'short' | 'tiny'
    'printAccessLog': true                   // true | false
  },
  'websocket': {
    'url': ':5679'
  }
};

module.exports = config;
