let config = {
  'sessionEngine': {
    'type': 'Memcached',                               // 'Redis' | 'Memcached' | 'Session' (do not use it in production)
    'remotes': ['127.0.0.1:11211'],
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
    'RegionOne': ':5679'
  },
  'port': 5678,
  'hostname': ''
};

module.exports = config;
