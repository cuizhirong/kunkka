var config = {
  'sessionEngine': {
    'type': 'Session',                               // 'Redis' | 'Memcached' | 'Session' (do not use it in production)
    'remotes': ['127.0.0.1:11211'],
    'secret': 'keyboard cat',
    'cookie_name': 'ustack'
  },
  'cookie': {
    'maxAge': 1000 * 60 * 60 * 24 * 7
  },
  'log': {
    'accessLogPath': '/var/log/halo/access_log.log',
    'errorLogPath': '/var/log/halo/error_log.log',
    'debug': false,                                // true | false
    'format': 'combined',                    // 'combined' | 'common' | 'dev' | 'short' | 'tiny'
    'printAccessLog': false                   // true | false
  },
  'websocket': {
    'url': ':5679'
  }
};

module.exports = config;
