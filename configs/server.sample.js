var config = {
  'remote': {
    'keystone': 'http://42.62.93.98:5000',
    'nova': {
      'RegionOne': 'http://42.62.93.98:8774'
    },
    'cinder': {
      'RegionOne': 'http://42.62.93.98:8776'
    },
    'neutron': {
      'RegionOne': 'http://42.62.93.98:9696'
    },
    'glance': {
      'RegionOne': 'http://42.62.93.98:9292'
    }
  },
  'region': [{
    'name': {
      'en': 'RegionOne',
      'zh-CN': '一区'
    },
    'id': 'RegionOne'
  }, {
    'name': {
      'en': 'RegionTwo',
      'zh-CN': '二区'
    },
    'id': 'RegionOne'
  }],
  'sessionEngine': {
    'type': 'Session',                               // 'Redis' | 'Memcached' | 'Session' (do not use it in production)
    'remotes': ['127.0.0.1:11211'],
    'secret': 'keyboard cat',
    'cookie_name': 'ustack'
  },
  'cookie': {
    'maxAge': ''
  },
  'log': {
    'accessLogPath': '/var/log/halo/access_log.log',
    'errorLogPath': '/var/log/halo/error_log.log',
    'debug': false,                                // true | false
    'format': 'combined',                    // 'combined' | 'common' | 'dev' | 'short' | 'tiny'
    'printAccessLog': false                   // true | false
  },
  'mq': {
    'enabled': true,
    'remotes': ['42.62.101.195'],
    'port': '5672',
    'heartbeat': 60,
    'username': 'openstack',
    'password': '4260ea44d3c55ac74c3241db',
    'sourceExchanges': ['nova', 'cinder', 'neutron', 'glance'],
    'reconnectTimeout': 1000,
    'maxTimeoutLimit': 120000
  },
  'websocket': {
    'url': ':8080',
    'port': 8080
  },
  'backend': {
    'type': 'openstack',
    'dirname': 'openstack_server'
  },
  'extension': {
    'type': 'example_qiniu'
  }
};

module.exports = config;
