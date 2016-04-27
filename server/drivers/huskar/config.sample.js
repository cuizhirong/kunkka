'use strict';

module.exports = {
  'dependencies': {
    'superagent': '^1.4.0'
  },
  'config': {
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
    'extension': {
      'type': ''
    }
  }
};
