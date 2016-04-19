'use strict';

module.exports = {
  'dependencies': {
    'superagent': '^1.4.0'
  },
  'config': {
    'remote': {
      'keystone': 'http://42.62.101.6:5000',
      'nova': {
        'RegionOne': 'http://42.62.101.6:8774'
      },
      'cinder': {
        'RegionOne': 'http://42.62.101.6:8776'
      },
      'neutron': {
        'RegionOne': 'http://42.62.101.6:9696'
      },
      'glance': {
        'RegionOne': 'http://42.62.101.6:9292'
      }
    },
    'extension': {
      'type': 'example_qiniu'
    }
  }
};
