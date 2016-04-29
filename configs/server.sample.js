var config = {
  'sessionEngine': {
    'type': 'Memcached',                               // 'Redis' | 'Memcached' | 'Session' (do not use it in production)
    'remotes': ['121.201.52.12:11211', '121.201.52.116:11211', '121.201.52.181:11211'],
    'secret': 'keyboard cat',
    'cookie_name': 'ustack'
  },
  'cookie': {
    'maxAge': 1000 * 60 * 60 * 24 * 7
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
